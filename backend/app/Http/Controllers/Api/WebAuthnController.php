<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WebAuthnCredential;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Webauthn\AttestationStatement\AttestationStatementSupportManager;
use Webauthn\AttestationVerifier;
use Webauthn\PublicKeyCredentialCreationOptions;
use Webauthn\PublicKeyCredentialDescriptor;
use Webauthn\PublicKeyCredentialRequestOptions;
use Webauthn\Server as WebauthnServer;
use Webauthn\TrustPath\EmptyTrustPath;

class WebAuthnController extends Controller
{
    private WebauthnServer $server;

    public function __construct()
    {
        $attestationManager = AttestationStatementSupportManager::create();
        $attestationVerifier = new AttestationVerifier($attestationManager);

        $this->server = new WebauthnServer(
            rpName: 'Attendance App',
            rpId: request()->getHost(),
            attestationVerifier: $attestationVerifier
        );
    }

    public function registerOptions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $existingCredentials = WebAuthnCredential::where('user_id', $user->id)->get();

        $publicKeyOptions = $this->server->generatePublicKeyCreationOptions(
            user: $user,
            excludeCredentials: $existingCredentials->map(fn($cred) => PublicKeyCredentialDescriptor::create(
                $cred->credential_id,
                ['backed', 'platform', 'cross-platform']
            ))->toArray(),
            timeout: 60000,
            authenticatorSelection: [
                'authenticatorAttachment' => 'platform',
                'userVerification' => 'required',
                'residentKey' => 'preferred',
            ]
        );

        $request->session()->put('webauthn_challenge', $publicKeyOptions->challenge);
        $request->session()->put('webauthn_user_id', $user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'challenge' => base64_encode($publicKeyOptions->challenge),
                'user' => [
                    'id' => base64_encode($user->id),
                    'name' => $user->email,
                    'displayName' => $user->name,
                ],
                'pubKeyCredParams' => $publicKeyOptions->pubKeyCredParams,
                'timeout' => $publicKeyOptions->timeout,
            ],
        ]);
    }

    public function registerVerify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'rawId' => 'required|string',
            'type' => 'required|string',
            'response.attestationObject' => 'required|string',
            'response.clientDataJSON' => 'required|string',
        ]);

        $challenge = $request->session()->pull('webauthn_challenge', null);
        $userId = $request->session()->pull('webauthn_user_id', null);

        if (!$challenge || !$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid session',
            ], 400);
        }

        try {
            $publicKeyCredentialSource = $this->server->loadAndCheckAttestationResponse(
                json_encode([
                    'id' => $validated['id'],
                    'rawId' => $validated['rawId'],
                    'type' => $validated['type'],
                    'response' => [
                        'attestationObject' => base64_decode($validated['response']['attestationObject']),
                        'clientDataJSON' => base64_decode($validated['response']['clientDataJSON']),
                    ],
                ]),
                base64_decode($challenge),
                null
            );

            WebAuthnCredential::updateOrCreate(
                [
                    'user_id' => $userId,
                    'credential_id' => $publicKeyCredentialSource->credentialId,
                ],
                [
                    'public_key' => json_encode($publicKeyCredentialSource->publicKey),
                    'counter' => $publicKeyCredentialSource->counter,
                    'device_type' => 'platform',
                    'transports' => json_encode($publicKeyCredentialSource->transports ?? []),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Credential registered successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function loginOptions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $credentials = WebAuthnCredential::where('user_id', $user->id)->get();

        if ($credentials->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No credentials registered',
            ], 404);
        }

        $publicKeyOptions = $this->server->generatePublicKeyRequestOptions(
            $credentials->map(fn($cred) => PublicKeyCredentialDescriptor::create(
                $cred->credential_id,
                ['backed', 'platform', 'cross-platform']
            ))->toArray(),
            timeout: 60000,
            userVerification: 'required'
        );

        $request->session()->put('webauthn_challenge', $publicKeyOptions->challenge);
        $request->session()->put('webauthn_user_id', $user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'challenge' => base64_encode($publicKeyOptions->challenge),
                'allowCredentials' => $credentials->map(fn($cred) => [
                    'id' => base64_encode($cred->credential_id),
                ])->toArray(),
                'timeout' => $publicKeyOptions->timeout,
            ],
        ]);
    }

    public function loginVerify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'rawId' => 'required|string',
            'type' => 'required|string',
            'response.authenticatorData' => 'required|string',
            'response.clientDataJSON' => 'required|string',
            'response.signature' => 'required|string',
            'response.userHandle' => 'nullable|string',
        ]);

        $challenge = $request->session()->pull('webauthn_challenge', null);
        $userId = $request->session()->pull('webauthn_user_id', null);

        if (!$challenge || !$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid session',
            ], 400);
        }

        try {
            $credential = WebAuthnCredential::where('user_id', $userId)
                ->where('credential_id', $validated['id'])
                ->firstOrFail();

            $publicKeyCredentialSource = $this->server->loadAndCheckAssertionResponse(
                json_encode([
                    'id' => $validated['id'],
                    'rawId' => $validated['rawId'],
                    'type' => $validated['type'],
                    'response' => [
                        'authenticatorData' => base64_decode($validated['response']['authenticatorData']),
                        'clientDataJSON' => base64_decode($validated['response']['clientDataJSON']),
                        'signature' => base64_decode($validated['response']['signature']),
                        'userHandle' => $validated['response']['userHandle']
                            ? base64_decode($validated['response']['userHandle'])
                            : null,
                    ],
                ]),
                $credential->public_key ? json_decode($credential->public_key, true) : null,
                base64_decode($challenge)
            );

            $credential->update([
                'counter' => $publicKeyCredentialSource->counter,
                'last_used_at' => now(),
            ]);

            $user = User::findOrFail($userId);
            $token = $user->createToken('auth_token')->plainTextToken;
            $refreshToken = \Illuminate\Support\Str::random(64);
            $user->update(['refresh_token' => $refreshToken]);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'refresh_token' => $refreshToken,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage(),
            ], 422);
        }
    }
}
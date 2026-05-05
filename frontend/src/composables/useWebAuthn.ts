import { ref } from 'vue'
import apiClient from '@/api/axios'

export function useWebAuthn() {
  const isRegistering = ref(false)
  const isVerifying = ref(false)
  const error = ref<string | null>(null)

  async function generateRegistrationOptions(userId: number): Promise<PublicKeyCredentialCreationOptions | null> {
    try {
      const response = await apiClient.post('/api/webauthn/register/options', { user_id: userId })
      const options = response.data.data

      return {
        challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
        rp: {
          name: 'Attendance App',
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0)),
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams.map((alg: number) => ({
          type: 'public-key',
          alg,
        })),
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
      }
    } catch (e) {
      error.value = 'Failed to generate registration options'
      return null
    }
  }

  async function registerCredential(credential: PublicKeyCredential) {
    isRegistering.value = true
    error.value = null

    try {
      const response = await credential.response as AuthenticatorAttestationResponse
      const payload = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
        },
      }

      await apiClient.post('/api/webauthn/register/verify', payload)
      return { success: true }
    } catch (e) {
      error.value = 'Failed to register credential'
      return { success: false }
    } finally {
      isRegistering.value = false
    }
  }

  async function generateAuthenticationOptions(email: string): Promise<PublicKeyCredentialRequestOptions | null> {
    try {
      const response = await apiClient.post('/api/webauthn/login/options', { email })
      const options = response.data.data

      return {
        challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
        timeout: 60000,
        rpId: window.location.hostname,
        allowCredentials: options.allowCredentials.map((cred: { id: string }) => ({
          type: 'public-key' as const,
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
        })),
        userVerification: 'required',
      }
    } catch (e) {
      error.value = 'Failed to generate authentication options'
      return null
    }
  }

  async function verifyCredential(credential: PublicKeyCredential) {
    isVerifying.value = true
    error.value = null

    try {
      const response = credential.response as AuthenticatorAssertionResponse
      const payload = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(response.authenticatorData))),
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
          signature: btoa(String.fromCharCode(...new Uint8Array(response.signature))),
          userHandle: response.userHandle
            ? btoa(String.fromCharCode(...new Uint8Array(response.userHandle)))
            : null,
        },
      }

      const apiResponse = await apiClient.post('/api/webauthn/login/verify', payload)
      return {
        success: true,
        data: apiResponse.data.data,
      }
    } catch (e) {
      error.value = 'Biometric verification failed'
      return { success: false }
    } finally {
      isVerifying.value = false
    }
  }

  async function startRegistration() {
    try {
      const options = await generateRegistrationOptions(0)
      if (!options) return { success: false }

      const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential
      return await registerCredential(credential)
    } catch (e) {
      error.value = 'Registration failed'
      return { success: false }
    }
  }

  async function startVerification(email: string) {
    try {
      const options = await generateAuthenticationOptions(email)
      if (!options) return { success: false }

      const credential = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential
      return await verifyCredential(credential)
    } catch (e) {
      error.value = 'Verification failed'
      return { success: false }
    }
  }

  return {
    isRegistering,
    isVerifying,
    error,
    startRegistration,
    startVerification,
  }
}
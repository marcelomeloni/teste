import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/constants';

export const useProfileAPI = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Função auxiliar para obter o identificador e método corretos do usuário logado
  const getAuthCredentials = useCallback(() => {
    console.log('🔑 [FRONTEND] Obtendo credenciais de autenticação...');
    
    if (auth.solanaWallet?.connected && auth.solanaWallet.publicKey) {
      const credentials = {
        identifier: auth.solanaWallet.publicKey.toString(),
        authMethod: 'solana'
      };
      console.log('✅ [FRONTEND] Credenciais Solana encontradas:', credentials);
      return credentials;
    }
    
    if (auth.user?.id) {
      const credentials = {
        identifier: auth.user.id,
        authMethod: 'google_firebase'
      };
      console.log('✅ [FRONTEND] Credenciais Firebase encontradas:', credentials);
      return credentials;
    }
    
    console.log('❌ [FRONTEND] Nenhuma credencial de autenticação encontrada');
    return null;
  }, [auth.solanaWallet, auth.user]);
  const uploadProfileImage = useCallback(async (imageFile, fileName) => {
    const credentials = getAuthCredentials();
    
    if (!credentials) {
      throw new Error('Usuário não autenticado');
    }
  
    const response = await fetch(`${API_URL}/api/auth/upload-image`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...credentials,
        imageFile: imageFile,
        fileName: fileName
      })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro no upload da imagem');
    }
  
    const data = await response.json();
    return data.imageUrl;
  }, [getAuthCredentials]);
  // Função para BUSCAR os dados do perfil
  const getProfile = useCallback(async () => {
    console.log('🚀 [FRONTEND] Iniciando busca do perfil...');
    
    const credentials = getAuthCredentials();
    
    if (!credentials) {
      console.log('❌ [FRONTEND] Erro: Credenciais não disponíveis');
      throw new Error('Usuário não autenticado');
    }

    // Previne múltiplas chamadas simultâneas
    if (isLoading) {
      console.log('⏭️ [FRONTEND] getProfile já em andamento, pulando...');
      return auth.profile;
    }

    setIsLoading(true);
    
    try {
      // 🔥 CORREÇÃO CRÍTICA: URL CORRIGIDA
      const API_ENDPOINT = `${API_URL}/api/auth/profile/get`
      console.log('📡 [FRONTEND] Fazendo requisição para API:');
      console.log('   - URL:', API_ENDPOINT);
      console.log('   - Método: POST');
      console.log('   - Credenciais:', credentials);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      console.log('📄 [FRONTEND] Resposta bruta da API:');
      console.log('   - Status:', response.status);
      console.log('   - OK:', response.ok);
      console.log('   - Headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('   - Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('   - Data Parsed:', data);
      } catch (parseError) {
        console.log('❌ [FRONTEND] Erro ao parsear JSON:', parseError);
        throw new Error('Resposta inválida do servidor');
      }
      
      if (!response.ok) {
        console.log('❌ [FRONTEND] Erro HTTP na resposta:', data);
        throw new Error(data.error || `Erro ${response.status} ao buscar perfil`);
      }

      if (!data.success) {
        console.log('❌ [FRONTEND] Resposta sem sucesso:', data);
        throw new Error(data.error || 'Resposta inválida do servidor');
      }

      console.log('✅ [FRONTEND] Perfil carregado com sucesso:', data.profile);
      
      // Atualiza o estado GLOBAL no AuthContext
      if (auth.setProfile) {
        console.log('🔄 [FRONTEND] Atualizando profile no AuthContext...');
        auth.setProfile(data.profile);
      } else {
        console.log('⚠️ [FRONTEND] auth.setProfile não disponível - verifique o AuthContext');
      }
      
      return data.profile;

    } catch (error) {
      console.error("❌ [FRONTEND] Falha completa ao buscar perfil:", error);
      console.error("   - Mensagem:", error.message);
      console.error("   - Stack:", error.stack);
      
      auth.showError(error.message || 'Erro ao carregar perfil');
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 [FRONTEND] getProfile finalizado');
    }
  }, [getAuthCredentials, auth, isLoading]);

  // Função para ATUALIZAR os dados do perfil
  const updateProfile = useCallback(async (newProfileData) => {
    console.log('🚀 [FRONTEND] Iniciando atualização do perfil...');
    
    const credentials = getAuthCredentials();
    
    if (!credentials) {
      const errorMsg = 'Você precisa estar logado para salvar.';
      console.log('❌ [FRONTEND]', errorMsg);
      auth.showError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!newProfileData) {
      const errorMsg = 'Dados do perfil são obrigatórios.';
      console.log('❌ [FRONTEND]', errorMsg);
      auth.showError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('📝 [FRONTEND] Dados para atualizar:', newProfileData);

    setIsLoading(true);
    
    try {
      // 🔥 CORREÇÃO: URL CORRIGIDA
      const API_ENDPOINT = `${API_URL}/api/auth/profile/update`;
      console.log('📡 [FRONTEND] Fazendo requisição para API:');
      console.log('   - URL:', API_ENDPOINT);
      console.log('   - Método: PUT');
      console.log('   - Credenciais:', credentials);
      console.log('   - ProfileData:', newProfileData);

      const response = await fetch(API_ENDPOINT, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          profileData: newProfileData
        })
      });

      console.log('📄 [FRONTEND] Resposta bruta da API:');
      console.log('   - Status:', response.status);
      console.log('   - OK:', response.ok);

      const responseText = await response.text();
      console.log('   - Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('   - Data Parsed:', data);
      } catch (parseError) {
        console.log('❌ [FRONTEND] Erro ao parsear JSON:', parseError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        console.log('❌ [FRONTEND] Erro HTTP na resposta:', data);
        
        // Tratamento específico para erro de CPF duplicado
        if (response.status === 409) {
          throw new Error('CPF_DUPLICATE: O CPF informado já está em uso.');
        }
        throw new Error(data.error || `Erro ${response.status} ao salvar perfil`);
      }

      if (!data.success) {
        console.log('❌ [FRONTEND] Resposta sem sucesso:', data);
        throw new Error(data.error || 'Resposta inválida do servidor');
      }

      console.log('✅ [FRONTEND] Perfil atualizado com sucesso:', data);
      
      // Atualiza o estado GLOBAL para refletir as mudanças
      if (auth.setProfile) {
        console.log('🔄 [FRONTEND] Atualizando profile no AuthContext com novos dados...');
        auth.setProfile(prev => {
          const updatedProfile = { ...prev, ...newProfileData };
          console.log('   - Profile anterior:', prev);
          console.log('   - Profile atualizado:', updatedProfile);
          return updatedProfile;
        });
      } else {
        console.log('⚠️ [FRONTEND] auth.setProfile não disponível - verifique o AuthContext');
      }

      auth.showSuccess(data.message || 'Perfil atualizado com sucesso!');
      return data;

    } catch (error) {
      console.error("❌ [FRONTEND] Falha completa ao atualizar perfil:", error);
      console.error("   - Mensagem:", error.message);
      console.error("   - Stack:", error.stack);
      
      // Mensagens de erro amigáveis
      let userFriendlyError = error.message;
      if (error.message.includes('CPF_DUPLICATE')) {
        userFriendlyError = 'O CPF informado já está em uso por outro usuário.';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        userFriendlyError = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      auth.showError(userFriendlyError);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 [FRONTEND] updateProfile finalizado');
    }
  }, [getAuthCredentials, auth]);

  return { 
    profile: auth.profile, 
    getProfile, 
    updateProfile, 
    uploadProfileImage, 
    isLoading 
  };
};
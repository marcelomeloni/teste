import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { debounce } from 'lodash';
import { useAuth } from '@/contexts/AuthContext'; 
// Componentes
import Avatar from '../../../components/Avatar';
import { Input } from '../../../components/Input'; 
import { Button } from '../../../components/Button';
import { FaExclamationCircle, FaCamera, FaSave, FaTimes } from 'react-icons/fa';

// Hooks
import { useProfileAPI } from '../../../hooks/useProfileAPI';

// --- SCHEMA DE VALIDAÇÃO COM ZOD - TODOS OS CAMPOS OPCIONAIS ---
const personalInfoSchema = z.object({
  nomeCompleto: z.string().min(1, 'Nome completo deve ter no mínimo 1 caractere.').optional().or(z.literal('')),
  email: z.string().email('Formato de e-mail inválido.').optional().or(z.literal('')),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  endereco: z.object({
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    bairro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    cidade: z.string().optional(),
  }).optional()
}).refine(data => {
  // Validação customizada: Se o formulário está vazio, não permite submit
  const hasAnyData = 
    data.nomeCompleto || 
    data.dataNascimento || 
    data.telefone || 
    data.cpf || 
    data.rg || 
    data.endereco?.cep ||
    data.endereco?.logradouro ||
    data.endereco?.bairro ||
    data.endereco?.numero ||
    data.endereco?.complemento ||
    data.endereco?.cidade;
  
  return hasAnyData;
}, {
  message: "Preencha pelo menos um campo para salvar",
  path: ["root"]
});

// Componente de Skeleton Loader
const SkeletonLoader = () => (
  <div className="animate-pulse p-6 bg-white rounded-lg shadow-md">
    <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
      <div className="rounded-full bg-gray-200 h-[120px] w-[120px] flex-shrink-0"></div>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
    <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// Funções auxiliares
const formatApiDataToForm = (apiData) => {
  if (!apiData) return null;
  
  return {
    nomeCompleto: apiData.name || apiData.nomeCompleto || '',
    email: apiData.email || '',
    dataNascimento: apiData.date_of_birth || apiData.dataNascimento || '',
    telefone: apiData.phone_number || apiData.telefone || '',
    cpf: apiData.cpf || '',
    rg: apiData.rg || '',
    imageUrl: apiData.profile_image_url || apiData.imageUrl || 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
    endereco: apiData.address || apiData.endereco || {
      cep: '',
      logradouro: '',
      bairro: '',
      numero: '',
      complemento: '',
      cidade: ''
    }
  };
};

const formatFormDataToApi = (formData) => {
    console.log('🔄 [FORMAT] Formatando dados do formulário para API:', formData);
    
    // ✅ CORREÇÃO: Manter os nomes em PORTUGUÊS que o backend espera
    const cleanData = {
      nomeCompleto: formData.nomeCompleto || null,
      dataNascimento: formData.dataNascimento || null,
      telefone: formData.telefone || null,
      rg: formData.rg || null,
      cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : null,
      endereco: formData.endereco || null
    };
  
    // Log para debug
    console.log('📤 [FORMAT] Dados formatados para envio:', cleanData);
  
    // Remove objetos vazios do endereço
    if (cleanData.endereco) {
      const cleanAddress = Object.fromEntries(
        Object.entries(cleanData.endereco).filter(([_, value]) => value && value !== '')
      );
      cleanData.endereco = Object.keys(cleanAddress).length > 0 ? cleanAddress : null;
    }
  
    // Remove campos completamente vazios
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === null || cleanData[key] === '' || cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
  
    console.log('🎯 [FORMAT] Dados finais para API:', cleanData);
    return cleanData;
  };

// Funções de máscara
const maskCPF = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCEP = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

function InformacoesPessoais() {
  const { profile, getProfile, updateProfile,getAuthCredentials, isLoading: profileLoading } = useProfileAPI();
  const auth = useAuth(); 
  const [initialData, setInitialData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const hasLoadedProfile = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty, isValid, touchedFields },
    reset,
    trigger
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      nomeCompleto: '',
      email: '',
      dataNascimento: '',
      telefone: '',
      cpf: '',
      rg: '',
      imageUrl: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
      endereco: {
        cep: '',
        logradouro: '',
        bairro: '',
        numero: '',
        complemento: '',
        cidade: '',
      }
    }
  });

  // Watch form values
  const formValues = watch();

  // Funções de onChange customizadas para aplicar máscaras
  const handleCpfChange = (e) => {
    const value = e.target.value;
    const maskedValue = maskCPF(value);
    setValue('cpf', maskedValue, { shouldValidate: true, shouldDirty: true });
  };

  const handleTelefoneChange = (e) => {
    const value = e.target.value;
    const maskedValue = maskPhone(value);
    setValue('telefone', maskedValue, { shouldValidate: true, shouldDirty: true });
  };

  const handleCepChange = (e) => {
    const value = e.target.value;
    const maskedValue = maskCEP(value);
    setValue('endereco.cep', maskedValue, { shouldValidate: true, shouldDirty: true });
  };

  // Atualizar preview da imagem
  useEffect(() => {
    if (formValues.imageUrl) {
      setImagePreview(formValues.imageUrl);
    }
  }, [formValues.imageUrl]);

  // Carregamento do perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (hasLoadedProfile.current) return;

      try {
        hasLoadedProfile.current = true;
        
        if (profile) {
          const formattedData = formatApiDataToForm(profile);
          if (formattedData) {
            reset(formattedData);
            setInitialData(formattedData);
            setImagePreview(formattedData.imageUrl);
          }
          return;
        }

        const profileData = await getProfile();
        if (profileData) {
          const formattedData = formatApiDataToForm(profileData);
          if (formattedData) {
            reset(formattedData);
            setInitialData(formattedData);
            setImagePreview(formattedData.imageUrl);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        hasLoadedProfile.current = false;
      }
    };

    loadProfile();
  }, [profile, getProfile, reset]);

  // Busca automática de CEP
  const handleCepLookup = useCallback(
    debounce(async (cep) => {
      const cleanCep = cep?.replace(/\D/g, '');
      if (!cleanCep || cleanCep.length !== 8) return;

      setIsCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setError('endereco.cep', { type: 'manual', message: 'CEP não encontrado' });
          return;
        }

        // Preenche os campos automaticamente
        setValue('endereco.logradouro', data.logradouro, { shouldValidate: true, shouldDirty: true });
        setValue('endereco.bairro', data.bairro, { shouldValidate: true, shouldDirty: true });
        setValue('endereco.cidade', data.localidade, { shouldValidate: true, shouldDirty: true });
        
        clearErrors(['endereco.logradouro', 'endereco.bairro', 'endereco.cidade']);
        
        setTimeout(() => {
          const numeroInput = document.querySelector('input[name="endereco.numero"]');
          if (numeroInput) numeroInput.focus();
        }, 100);
        
      } catch (error) {
        setError('endereco.cep', { type: 'manual', message: 'Erro ao buscar CEP' });
      } finally {
        setIsCepLoading(false);
      }
    }, 1000),
    [setValue, setError, clearErrors]
  );

  useEffect(() => {
    if (formValues.endereco?.cep && formValues.endereco.cep.replace(/\D/g, '').length === 8) {
      handleCepLookup(formValues.endereco.cep);
    }
  }, [formValues.endereco?.cep, handleCepLookup]);

  const getAuthCredentialsSafe = useCallback(() => {
    // Primeiro tenta pelo hook useProfileAPI
    if (getAuthCredentials) {
      const credentials = getAuthCredentials();
      if (credentials) return credentials;
    }
    
    // Fallback: usa lógica direta com useAuth
    console.log('🔑 [FALLBACK] Obtendo credenciais via useAuth...');
    
    if (auth.solanaWallet?.connected && auth.solanaWallet.publicKey) {
      const credentials = {
        identifier: auth.solanaWallet.publicKey.toString(),
        authMethod: 'solana'
      };
      console.log('✅ [FALLBACK] Credenciais Solana encontradas:', credentials);
      return credentials;
    }
    
    if (auth.user?.id) {
      const credentials = {
        identifier: auth.user.id,
        authMethod: 'google_firebase'
      };
      console.log('✅ [FALLBACK] Credenciais Firebase encontradas:', credentials);
      return credentials;
    }
    
    console.log('❌ [FALLBACK] Nenhuma credencial de autenticação encontrada');
    return null;
  }, [getAuthCredentials, auth]);

  // 🔥 FUNÇÃO DE UPLOAD CORRIGIDA
  const uploadImageToBackend = async (base64Image, fileName) => {
    const credentials = getAuthCredentialsSafe(); // 🔥 USA FUNÇÃO SEGURA
    
    if (!credentials) {
      throw new Error('Usuário não autenticado');
    }

    console.log('📤 [UPLOAD] Enviando imagem para backend...');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          imageFile: base64Image,
          fileName: fileName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload da imagem');
      }

      const data = await response.json();
      console.log('✅ [UPLOAD] Imagem enviada com sucesso:', data.imageUrl);
      return data.imageUrl;
    } catch (error) {
      console.error('❌ [UPLOAD] Erro no upload:', error);
      throw error;
    }
  };

  // 🔥 FUNÇÃO DE UPLOAD DE IMAGEM CORRIGIDA
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB.');
      return;
    }

    setUploadingImage(true);

    try {
      // Converte a imagem para Base64
      const base64Image = await convertToBase64(file);
      
      // Preview local
      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);
      
      // 🔥 Upload para o backend
      const imageUrl = await uploadImageToBackend(base64Image, file.name);
      
      // Atualiza o formulário com a URL do Supabase
      setValue('imageUrl', imageUrl, { shouldValidate: true, shouldDirty: true });
      
      toast.success('Imagem de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  // 🔥 FUNÇÃO PARA CONVERTER BASE64 (certifique-se de que existe)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
 
  const onSubmit = async (formData) => {
    if (!isDirty) {
      toast.success('Nenhuma alteração para salvar');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Salvando alterações...');

    try {
      const apiData = formatFormDataToApi(formData);
      console.log('📤 Dados enviados para API:', apiData);
      
      // 🔥 Se há uma nova imagem (que não é a padrão), inclui no payload
      if (formData.imageUrl && 
          formData.imageUrl.startsWith('data:') && 
          !formData.imageUrl.includes('avatar-1577909_1280.png')) {
        apiData.imageFile = formData.imageUrl;
      }
      
      await updateProfile(apiData);
      
      setInitialData(formData);
      toast.success('Dados atualizados com sucesso!', { id: toastId });
      
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      
      if (error.message.includes('CPF_DUPLICATE') || error.message.includes('CPF')) {
        setError('cpf', { type: 'manual', message: 'CPF já está em uso' });
        toast.error('CPF já está em uso por outro usuário.', { id: toastId });
      } else {
        toast.error(error.message || 'Ocorreu um erro ao salvar.', { id: toastId });
      }
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    reset(initialData);
    toast.success('Alterações canceladas');
  };

  // 🔥 BOTÃO HABILITADO APENAS SE:
  // 1. Há alterações (isDirty) 
  // 2. Pelo menos um campo foi preenchido
  // 3. Não está salvando
  const hasAnyData = () => {
    return (
      formValues.nomeCompleto ||
      formValues.dataNascimento ||
      formValues.telefone ||
      formValues.cpf ||
      formValues.rg ||
      formValues.endereco?.cep ||
      formValues.endereco?.logradouro ||
      formValues.endereco?.bairro ||
      formValues.endereco?.numero ||
      formValues.endereco?.complemento ||
      formValues.endereco?.cidade
    );
  };

  const isSaveEnabled = isDirty && hasAnyData() && !isSaving;

  const isLoading = profileLoading && !initialData;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Minhas Informações Pessoais</h2>
          <p className="text-gray-600">Todos os campos são opcionais - preencha apenas os que desejar</p>
        </div>

        {/* Seção Informações Pessoais */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Avatar Upload */}
            <div className="flex-shrink-0 relative">
              <div className="relative group">
                <Avatar 
                  imageUrl={imagePreview} 
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-2xl transition-all duration-200 flex items-center justify-center">
                  <label htmlFor="image-upload" className={`cursor-pointer ${uploadingImage ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
                    <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                      ) : (
                        <FaCamera className="text-gray-700 text-lg" />
                      )}
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                {uploadingImage ? 'Enviando...' : 'Clique para alterar'}
              </p>
            </div>

            {/* Campos de Informações Pessoais */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <Input 
                label="Nome completo" 
                type="text" 
                {...register('nomeCompleto')} 
                error={errors.nomeCompleto?.message}
                placeholder="Seu nome completo"
              />
              
              <Input 
                label="Endereço de e-mail" 
                type="email" 
                {...register('email')} 
                disabled 
                error={errors.email?.message}
                tooltip="Seu e-mail não pode ser alterado por aqui."
              />
              
              <Input 
                label="Data de nascimento" 
                type="date" 
                {...register('dataNascimento')} 
                error={errors.dataNascimento?.message}
              />
              
              <Input 
                label="Telefone para contato" 
                type="tel"
                {...register('telefone')}
                onChange={handleTelefoneChange}
                error={errors.telefone?.message}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
              
              <Input 
                label="CPF" 
                type="text" 
                {...register('cpf')}
                onChange={handleCpfChange}
                error={errors.cpf?.message}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              
              <Input 
                label="RG" 
                type="text" 
                {...register('rg')} 
                error={errors.rg?.message}
                placeholder="Seu RG"
              />
            </div>
          </div>
        </section>

        {/* Seção Endereço */}
        <section className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Endereço de Correspondência</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input 
              label="CEP" 
              type="text" 
              {...register('endereco.cep')}
              onChange={handleCepChange}
              maxLength={9}
              isLoading={isCepLoading}
              error={errors.endereco?.cep?.message}
              placeholder="00000-000"
            />
            
            <Input 
              label="Endereço" 
              type="text" 
              {...register('endereco.logradouro')} 
              error={errors.endereco?.logradouro?.message}
              placeholder="Rua, Avenida, etc."
            />
            
            <Input 
              label="Bairro" 
              type="text" 
              {...register('endereco.bairro')} 
              error={errors.endereco?.bairro?.message}
              placeholder="Seu bairro"
            />
            
            <Input 
              label="Número" 
              type="text" 
              {...register('endereco.numero')} 
              error={errors.endereco?.numero?.message}
              placeholder="123"
            />
            
            <Input 
              label="Complemento" 
              type="text" 
              {...register('endereco.complemento')} 
              error={errors.endereco?.complemento?.message}
              placeholder="Apto, Casa, etc."
            />
            
            <Input 
              label="Cidade" 
              type="text" 
              {...register('endereco.cidade')} 
              error={errors.endereco?.cidade?.message}
              placeholder="Sua cidade"
            />
          </div>
        </section>

        {/* Ações do Formulário */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDirty && (
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <FaExclamationCircle className="text-amber-500" />
                <span>Você tem alterações não salvas</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1 sm:flex-none"
              disabled={!isDirty || isSaving}
              onClick={handleCancel}
            >
              <FaTimes className="text-lg" />
              CANCELAR
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1 sm:flex-none"
              disabled={!isSaveEnabled} 
              isLoading={isSaving}
            >
              <FaSave className="text-lg" />
              {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </Button>
          </div>
        </div>

        {/* Mensagem de erro global */}
        {errors.root && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.root.message}</p>
          </div>
        )}
      </form>
    </div>
  );
}

export default InformacoesPessoais;
import { useState, useEffect } from 'react';
import { useEventForm } from '@/contexts/EventFormContext';
import { ImageUp, Calendar, Ticket, Eye, Info, PenSquare, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

// --- CONSTANTE DE VALIDAÇÃO ---
const MAX_FILE_SIZE_BYTES = 300 * 1024; // 300KB

// Subcomponente para Uploader de Imagem (Reutilizável)
function ImageUploader({ label, recommendation, aspectRatio, previewSrc, onUpload, onRemove, error }) {
  const aspectClasses = {
    '16/9': 'aspect-video',
    '1:1': 'aspect-square',
    '3:1': 'aspect-[3/1]'
  };
  const aspectClass = aspectClasses[aspectRatio] || 'aspect-video';

  return (
    <div>
      <Label icon={ImageUp}>{label} *</Label>
      <div className={`relative mt-2 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col justify-center items-center text-center p-6 transition-all duration-300 group hover:border-indigo-500 hover:bg-indigo-50 ${aspectClass} ${error ? 'border-red-500 bg-red-50' : ''}`}>
        {previewSrc ? (
          <>
            <img 
              src={previewSrc} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
            <div className="relative z-10 flex gap-3 p-4 bg-black/50 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onUpload}
                className="px-4 py-2 bg-white text-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2"
              >
                <UploadCloud size={16} /> Alterar
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} /> Remover
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-slate-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mx-auto transition-colors">
              <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div>
              <button
                type="button"
                onClick={onUpload}
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clique para enviar
              </button>
              <p className="text-xs text-slate-500 mt-1">ou arraste e solte o ficheiro</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-slate-500 text-sm mt-2">{recommendation}</p>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Subcomponente para Labels (Consistência Visual)
function Label({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
      <Icon size={16} className="text-slate-500" />
      <span>{children}</span>
    </label>
  );
}

export function EventDetailsSection() {
  const { formData, handleFormDataChange, handleFileChange, errors } = useEventForm();

  const [bannerPreview, setBannerPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Alterado de nftPreview

  // ✅ ==================================================================
  // ✅ CORREÇÃO: Sincroniza o preview local com os dados do formulário global.
  // ✅ Este hook é a chave para fazer as imagens aparecerem na edição.
  // ✅ ==================================================================
  useEffect(() => {
    // Função auxiliar para criar/limpar URLs de preview
    const updatePreview = (value, setPreview) => {
      if (typeof value === 'string') { // Se for uma URL (vindo da API)
        setPreview(value);
      } else if (value instanceof File) { // Se for um arquivo novo
        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);
        // Retorna uma função de limpeza para revogar a URL do objeto e evitar vazamentos de memória
        return () => URL.revokeObjectURL(objectUrl);
      } else { // Se for nulo ou indefinido
        setPreview(null);
      }
    };

    const cleanupBanner = updatePreview(formData.bannerImage, setBannerPreview); // Alterado de formData.image
    const cleanupImage = updatePreview(formData.image, setImagePreview); // Alterado de formData.nftImage e setNftPreview
    
    // Função de limpeza geral do useEffect
    return () => {
      if (cleanupBanner) cleanupBanner();
      if (cleanupImage) cleanupImage(); // Alterado de cleanupNft
    };

  }, [formData.bannerImage, formData.image]); // Alterado de [formData.image, formData.nftImage]

  // Handlers para upload e remoção de imagens
  const createUploadHandler = (imageType) => (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Arquivo muito grande! O máximo é ${MAX_FILE_SIZE_BYTES / 1024}KB.`);
      return;
    }
    
    // Atualiza o estado global no contexto. O useEffect cuidará do preview.
    handleFileChange(imageType, file);
  };

  const createRemoveHandler = (imageType) => () => {
    // Limpa o estado global no contexto. O useEffect cuidará de limpar o preview.
    handleFileChange(imageType, null);
    
    const inputId = imageType === 'bannerImage' ? 'bannerImageUpload' : 'imageUpload'; // Alterado de 'image' e 'nftUpload'
    const inputElement = document.getElementById(inputId);
    if (inputElement) inputElement.value = null;
  };

  const handleBannerImageUpload = createUploadHandler('bannerImage'); // Alterado de handleBannerUpload e 'image'
  const handleRemoveBannerImage = createRemoveHandler('bannerImage'); // Alterado de handleRemoveBanner e 'image'
  const handleImageUpload = createUploadHandler('image'); // Alterado de handleNftUpload e 'nftImage'
  const handleRemoveImage = createRemoveHandler('image'); // Alterado de handleRemoveNft e 'nftImage'


  const categories = [
    'Música', 'Esportes', 'Arte e Cultura', 'Tecnologia', 'Negócios', 
    'Educação', 'Gastronomia', 'Saúde e Bem-estar', 'Moda', 'Outro'
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Público', description: 'Qualquer pessoa pode ver e se inscrever.' },
    { value: 'private', label: 'Privado', description: 'Apenas pessoas com o link podem acessar.' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">1</div>
        <h2 className="text-2xl font-bold text-slate-900">Detalhes do Evento</h2>
      </div>

      <div className="space-y-8">
        {/* Nome do Evento */}
        <div>
          <Label icon={PenSquare}>Nome do evento *</Label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={handleFormDataChange}
            name="name"
            className={`w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
            placeholder="Ex: Festival de Verão 2025"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Upload de Imagens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      	{/* Banner */}
          <ImageUploader
            label="Banner do Evento (3:1)"
            recommendation="Recomendado: 1500x500px. Máximo de 300KB."
            aspectRatio="3:1"
            previewSrc={bannerPreview}
            onUpload={() => document.getElementById('bannerImageUpload').click()}
            onRemove={handleRemoveBannerImage}
            error={errors.bannerImage}
          />
          <input id="bannerImageUpload" type="file" accept="image/jpeg, image/png, image/webp" onChange={handleBannerImageUpload} className="hidden" />

      	{/* Imagem do Ingresso */}
          <ImageUploader
            label="Arte do Ingresso (1:1)"
            recommendation="Recomendado: 1024x1024px. Máximo de 300KB."
            aspectRatio="1:1"
            previewSrc={imagePreview}
            onUpload={() => document.getElementById('imageUpload').click()}
            onRemove={handleRemoveImage}
            error={errors.image}
          />
          <input id="imageUpload" type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Datas e Horários */}
        <div>
          <Label icon={Calendar}>Quando o evento acontece? *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div>
              <input
                type="datetime-local"
                value={formData.startDate || ''}
                onChange={handleFormDataChange}
                name="startDate"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${errors.startDate ? 'border-red-500' : 'border-slate-300'}`}
              />
              <p className="text-slate-500 text-xs mt-2">Início do evento (Horário Local)</p>
              {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <input
                type="datetime-local"
                value={formData.endDate || ''}
                onChange={handleFormDataChange}
                name="endDate"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${errors.endDate ? 'border-red-500' : 'border-slate-300'}`}
              />
              <p className="text-slate-500 text-xs mt-2">Fim do evento (Horário Local)</p>
              {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Categoria e Visibilidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label icon={Ticket}>Categoria do evento *</Label>
            <select
              value={formData.category || ''}
              onChange={handleFormDataChange}
              name="category"
              className={`w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white ${errors.category ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <Label icon={Eye}>Visibilidade do evento *</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {visibilityOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFormDataChange({ target: { name: 'visibility', value: option.value } })}
                  className={`p-4 text-left rounded-xl border-2 transition-all ${
                    formData.visibility === option.value 
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-300' 
                      : 'border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  <p className="font-semibold text-slate-800">{option.label}</p>
                  <p className="text-xs text-slate-600 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
              {errors.visibility && <p className="text-red-600 text-sm mt-2">{errors.visibility}</p>}
          </div>
        </div>

        {/* Descrição do Evento */}
        <div>
          <Label icon={Info}>Descrição do evento *</Label>
          <textarea
            value={formData.description || ''}
            onChange={handleFormDataChange}
          	name="description"
          	rows={8}
          	className={`w-full mt-2 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-y ${errors.description ? 'border-red-500' : 'border-slate-300'}`}
          	placeholder="Descreva seu evento de forma atrativa... Inclua a programação, informações importantes, artistas confirmados, etc."
          />
          <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">
          	<Sparkles size={14} className="text-indigo-500"/> Dica: use markdown para formatar o texto e adicionar links.
          </p>
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatterStore } from '../../store/matterStore';
import toast from 'react-hot-toast';
import { Loader, ArrowLeft, FileText, Download } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../API_URL';

const ViewPdf = () => {
    const { subjectId, publicId } = useParams();
    const decodedPublicId = decodeURIComponent(publicId);
    const navigate = useNavigate();
    
    const { fetchAllSubjects, hasFetchedAllSubjects } = useMatterStore();
    const [isLoading, setIsLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfName, setPdfName] = useState('');

    useEffect(() => {
        let objectUrl = null;

        const checkAccessAndFetchPdf = async () => {
            try {
                // 1. Validação básica de interface
                if (!hasFetchedAllSubjects) {
                    await fetchAllSubjects(true);
                }
                
                const subjects = useMatterStore.getState().allSubjects;
                const subject = subjects.find(s => s._id === subjectId);
                
                if (!subject) {
                    toast.error("Usuário não autorizado!", { id: 'unauthorized_pdf' });
                    navigate('/', { replace: true });
                    return;
                }

                const attachment = subject.attachments.find(a => a.public_id === decodedPublicId);
                if (!attachment) {
                    toast.error("Arquivo não encontrado!", { id: 'not_found_pdf' });
                    navigate('/', { replace: true });
                    return;
                }

                setPdfName(attachment.name);

                // 2. Busca do PDF no nosso Backend (Proxy) enviando o cookie de segurança
                const response = await axios.get(`${API_URL}/subject/stream-pdf/${subjectId}/${encodeURIComponent(decodedPublicId)}`, {
                    withCredentials: true, // Garante que o usuário logado seja validado
                    responseType: 'blob'   //Trata a resposta como arquivo binário
                });

                // 3. Cria uma URL temporária e segura na memória do navegador do usuário
                objectUrl = URL.createObjectURL(response.data);
                setPdfUrl(objectUrl);
                setIsLoading(false);

            } catch (error) {
                console.error("Erro ao carregar PDF:", error);
                toast.error(error.response?.data?.message || "Acesso negado ou erro ao carregar o arquivo.");
                navigate('/', { replace: true });
            }
        };

        checkAccessAndFetchPdf();

        // 4. Limpa a memória quando o usuário sai da página
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [subjectId, decodedPublicId, navigate, fetchAllSubjects, hasFetchedAllSubjects]);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-base-content/50">
                <Loader className="animate-spin mb-4" size={40} />
                <p className="font-medium animate-pulse">carregando arquivo...</p>
            </div>
        );
    }

    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    
    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 bg-base-200/50 overflow-hidden ">
                <iframe 
                    src={googleViewerUrl} 
                    className="w-full h-full" 
                    title="Visualizador de PDF Seguro"
                ></iframe>
            </div>
        </div>
    );
};

export default ViewPdf;

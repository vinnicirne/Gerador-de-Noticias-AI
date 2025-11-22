
import React from 'react';
import { GenerationHistoryItem, GeneratedNews, GeneratedCopy, LandingPageData, GeneratedPrompt, GeneratedCanvaStructure } from '../types';
import SEOPreview from './SEOPreview';
import QualityScoreCard from './QualityScoreCard';

interface HistoryDetailViewProps {
    item: GenerationHistoryItem;
}

const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({ item }) => {

    const renderInputs = () => {
        if (!item.inputs) return null;
        return (
            <div className="bg-gray-900/30 p-4 rounded-lg border border-[#136c0b]/20 mb-6">
                <h4 className="text-xs font-bold text-[#1b8a0f] uppercase mb-2 tracking-wider">Parâmetros da Geração</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {Object.entries(item.inputs).map(([key, value]) => (
                        <div key={key}>
                            <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> <span className="text-white font-medium">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderNews = (data: GeneratedNews) => (
        <div>
            <SEOPreview title={data.seo.title} slug={data.seo.slug} description={data.seo.description} />
            {data.validation && <div className="mt-4"><QualityScoreCard metrics={data.validation} /></div>}
            <h4 className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Conteúdo</h4>
            <div className="p-4 bg-black rounded border border-gray-800 text-xs whitespace-pre-wrap">{data.content}</div>
        </div>
    );

    const renderLandingPage = (data: LandingPageData) => (
         <div>
            <SEOPreview title={data.seo.title} slug={data.seo.slug} description={data.seo.description} />
            {data.validation && <div className="mt-4"><QualityScoreCard metrics={data.validation} /></div>}
            <h4 className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Conteúdo</h4>
            <div className="p-4 bg-black rounded border border-gray-800 text-xs whitespace-pre-wrap">{data.content}</div>
        </div>
    );
    
    const renderCopy = (data: GeneratedCopy) => (
         <div>
            <SEOPreview title={data.seo.title} slug={data.seo.slug} description={data.seo.description} />
            {data.validation && <div className="mt-4"><QualityScoreCard metrics={data.validation} /></div>}
            <h4 className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Conteúdo ({data.copyType})</h4>
            <div className="p-4 bg-black rounded border border-gray-800 text-xs whitespace-pre-wrap">{data.content}</div>
        </div>
    );
    
    const renderPrompt = (data: GeneratedPrompt) => (
        <div>
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-500">Plataforma: <span className="text-gray-300">{data.platform}</span></span>
                <span className="font-bold text-gray-500">Categoria: <span className="text-gray-300">{data.category}</span></span>
            </div>
            <div className="mt-2 p-4 bg-black rounded border border-gray-800 text-xs font-mono whitespace-pre-wrap">{data.prompt}</div>
        </div>
    );

    const renderCanva = (data: GeneratedCanvaStructure) => (
        <div>
            <span className="text-xs font-bold text-gray-500">Tipo de Documento: <span className="text-gray-300">{data.docType}</span></span>
            <div className="mt-2 p-4 bg-black rounded border border-gray-800 text-xs whitespace-pre-wrap">{data.content}</div>
        </div>
    );


    const renderDetail = () => {
        switch (item.generationType) {
            case 'news':
                return renderNews(item.result as GeneratedNews);
            case 'landing_page':
                return renderLandingPage(item.result as LandingPageData);
            case 'copy':
                return renderCopy(item.result as GeneratedCopy);
            case 'prompt':
                return renderPrompt(item.result as GeneratedPrompt);
            case 'canva':
                return renderCanva(item.result as GeneratedCanvaStructure);
            default:
                return <pre className="text-xs font-mono">{JSON.stringify(item.result, null, 2)}</pre>;
        }
    };

    return (
        <div className="animate-fade-in">
            {renderInputs()}
            {renderDetail()}
        </div>
    );
};

export default HistoryDetailView;

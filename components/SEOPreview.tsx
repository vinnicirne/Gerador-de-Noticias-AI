import React from 'react';

interface SEOPreviewProps {
  title: string;
  slug: string;
  description: string;
}

const SEOPreview: React.FC<SEOPreviewProps> = ({ title, slug, description }) => {
  const siteUrl = 'https://seusite.com/';

  return (
    <div>
        <h2 className="text-xl font-bold text-[#1b8a0f] border-l-4 border-[#1b8a0f] pl-3 mb-4">Prévia de SEO (Google)</h2>
        <div className="bg-gray-900/50 p-4 rounded-lg border border-[#136c0b]/20">
            <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#1b8a0f] rounded-full flex-shrink-0"></div>
                <div>
                    <div className="text-sm text-white">Seu Site</div>
                    <div className="text-xs text-gray-400">{siteUrl}{slug}</div>
                </div>
            </div>
            <h3 className="text-blue-400 text-xl font-medium mt-2 truncate hover:underline cursor-pointer">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
    </div>
  );
};

export default SEOPreview;

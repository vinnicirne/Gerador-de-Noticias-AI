
import { RankMathSEOData, SEOAnalysisReport } from '../types';

class SEOAnalyzerService {
  
  public analyze(content: string, seoData: RankMathSEOData): SEOAnalysisReport {
    const keywordDensity = this.calculateKeywordDensity(content, seoData.primaryKeyword);
    const metaAnalysis = this.analyzeMetaTags(seoData);
    const schemaJsonLd = this.generateSchemaMarkup(seoData);
    
    const recommendations = this.generateRecommendations(keywordDensity, metaAnalysis);
    const score = this.calculateScore(keywordDensity, metaAnalysis, recommendations.length);
    
    // Calculate word count
    const wordCount = content ? content.trim().split(/\s+/).length : 0;

    return {
      score,
      keywordDensity,
      metaAnalysis,
      recommendations,
      schemaJsonLd,
      wordCount
    };
  }

  private calculateKeywordDensity(content: string, keyword: string) {
    if (!content || !keyword) return { count: 0, density: 0, status: 'low' as const };

    const cleanContent = content.replace(/[^\w\s]/gi, '').toLowerCase();
    const cleanKeyword = keyword.toLowerCase();
    const totalWords = cleanContent.split(/\s+/).length;
    
    // Regex simples para contar ocorrências exatas
    const regex = new RegExp(`\\b${cleanKeyword}\\b`, 'gi');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    
    const density = totalWords > 0 ? (count / totalWords) * 100 : 0;
    const roundedDensity = Math.round(density * 100) / 100;

    let status: 'low' | 'good' | 'high' = 'good';
    if (roundedDensity < 0.5) status = 'low';
    else if (roundedDensity > 3.0) status = 'high';

    return { count, density: roundedDensity, status };
  }

  private analyzeMetaTags(seoData: RankMathSEOData) {
    const titleLength = seoData.title.length;
    const descriptionLength = seoData.description.length;
    const cleanKeyword = seoData.primaryKeyword.toLowerCase();

    return {
      titleLength,
      titleHasKeyword: seoData.title.toLowerCase().includes(cleanKeyword),
      descriptionLength,
      descriptionHasKeyword: seoData.description.toLowerCase().includes(cleanKeyword),
    };
  }

  private generateSchemaMarkup(seoData: RankMathSEOData): string {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": seoData.schemaType || "Article",
      "headline": seoData.title,
      "description": seoData.description,
      "keywords": [seoData.primaryKeyword, ...seoData.secondaryKeywords].join(", "),
      "author": {
        "@type": "Organization",
        "name": "GDN_IA Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Sua Empresa",
        "logo": {
          "@type": "ImageObject",
          "url": "https://seusite.com/logo.png"
        }
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString()
    };

    if (seoData.schemaType === 'Product') {
        schema["brand"] = { "@type": "Brand", "name": "Produto" };
        schema["offers"] = { "@type": "Offer", "price": "0.00", "priceCurrency": "BRL" };
    }

    return JSON.stringify(schema, null, 2);
  }

  private generateRecommendations(density: any, meta: any): string[] {
    const recs: string[] = [];

    if (density.status === 'low') recs.push("Aumente a densidade da palavra-chave no conteúdo (foco em 1% a 2.5%).");
    if (density.status === 'high') recs.push("Cuidado com 'Keyword Stuffing'. Reduza a repetição da palavra-chave.");
    
    if (meta.titleLength > 60) recs.push("O Título SEO está muito longo (ideal: máx 60 caracteres).");
    if (meta.titleLength < 30) recs.push("O Título SEO está muito curto.");
    if (!meta.titleHasKeyword) recs.push("Inclua a palavra-chave principal no Título SEO.");

    if (meta.descriptionLength > 160) recs.push("A Meta Descrição está muito longa (ideal: máx 160 caracteres).");
    if (!meta.descriptionHasKeyword) recs.push("Inclua a palavra-chave principal na Meta Descrição.");

    return recs;
  }

  private calculateScore(density: any, meta: any, recCount: number): number {
    let score = 100;
    
    if (density.status !== 'good') score -= 20;
    if (!meta.titleHasKeyword) score -= 15;
    if (!meta.descriptionHasKeyword) score -= 15;
    if (meta.titleLength > 60 || meta.titleLength < 30) score -= 5;
    if (meta.descriptionLength > 160) score -= 5;

    return Math.max(0, score);
  }
}

export const seoAnalyzer = new SEOAnalyzerService();

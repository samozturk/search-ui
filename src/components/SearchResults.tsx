import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface SearchResults {
    abstract: string[];
    relevance_score: number[];
}

interface ResultItem {
    abstract: string;
    score: number;
}

const SearchResults: React.FC = () => {
    const [keyword, setKeyword] = useState<string>('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [precisionRecall, setPrecisionRecall] = useState<number>(0.5);
    const [apiResponse, setApiResponse] = useState<any>(null);

    const getRelevanceColor = (score: number): string => {
        const red = Math.floor(255 * (1 - score));
        const green = Math.floor(255 * score);
        return `rgb(${red}, ${green}, 0)`;
    };

    const LoadingSkeleton = () => (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg" />
                </div>
            ))}
        </div>
    );

    const handleSearch = useCallback(async () => {
        if (!keyword.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/search', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    keywords: [keyword],
                    precision_recall_balance: precisionRecall
                })
            });
            if (!response.ok) throw new Error('Search request failed');
            const data = await response.json();
            setApiResponse(data);

            const results = data.results.abstract.map((abstract: string, index: number) => ({
                abstract,
                score: data.results.relevance_score[index]
            }));

            const sortedResults = results.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

            setResults({
                abstract: sortedResults.map((r: ResultItem) => r.abstract),
                relevance_score: sortedResults.map((r: ResultItem) => r.score)
            });
        } catch (error) {
            setError('Search failed. Please try again.');
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    }, [keyword, precisionRecall]);

    useEffect(() => {
        const search = async () => {
            if (keyword.trim()) {
                await handleSearch();
            }
        };
        void search();
    }, [precisionRecall, handleSearch, keyword]);

    return (
        <div className="min-h-screen  py-8">
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold text-gray-800">Patent Search</h1>
                    <p className="text-sm text-gray-600">Search through patents using natural language</p>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <Input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Enter keywords to search..."
                            className="flex-1 h-12 text-lg shadow-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={loading}
                            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 shadow-sm"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                                    Searching...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Search
                                </div>
                            )}
                        </Button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-2 shadow-inner">
                        <label className="flex justify-between text-sm font-medium text-gray-700">
                            <span>Precision-Recall Balance</span>
                            <span className="font-mono">{precisionRecall.toFixed(2)}</span>
                        </label>
                        <Slider
                            value={[precisionRecall]}
                            onValueChange={(value) => setPrecisionRecall(value[0])}
                            min={0}
                            max={1}
                            step={0.1}
                            className="w-full"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    results && apiResponse && (
                        <div className="space-y-6">
                            <div className="text-sm text-gray-500">Found {results.abstract.length} results</div>
                            {results.abstract.map((text, index) => (
                                <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-gray-500">#{index + 1}</span>
                                                </div>
                                                <h3 className="font-medium text-gray-700 mb-2">Abstract</h3>
                                                <p className="text-sm text-gray-600" dir="auto">{text}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <p className="text-xs text-gray-500 mb-1">Relevance Score</p>
                                                    <div
                                                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner transition-colors"
                                                        style={{ backgroundColor: getRelevanceColor(results.relevance_score[index]) }}
                                                    >
                                                        {(results.relevance_score[index] * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <p className="text-xs text-gray-500 mb-1">Degree Between Vectors</p>
                                                    <div
                                                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner transition-colors"
                                                        style={{ backgroundColor: getRelevanceColor(apiResponse.results.degree_between[index] / 100) }}
                                                    >
                                                        {apiResponse.results.degree_between[index].toFixed(0)}°
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SearchResults;
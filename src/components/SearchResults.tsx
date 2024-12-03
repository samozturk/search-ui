import React, { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
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
    const [precisionRecall, setPrecisionRecall] = useState<number>(0.5);
    const [apiResponse, setApiResponse] = useState<any>(null);

    const getRelevanceColor = (score: number): string => {
        const red = Math.floor(255 * (1 - score));
        const green = Math.floor(255 * score);
        return `rgb(${red}, ${green}, 0)`;
    };

    const handleSearch = useCallback(async () => {
        if (!keyword.trim()) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/search', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    keywords: [keyword],
                    precision_recall_balance: precisionRecall
                })
            });
            const data = await response.json();
            setApiResponse(data);

            const results = data.results.abstract.map((abstract: string, index: number) => ({
                abstract,
                score: data.results.relevance_score[index]
            }));

            const sortedResults = results.sort((a: { score: number }, b: { score: number }) => b.score - a.score).slice(0, 10);

            setResults({
                abstract: sortedResults.map((r: ResultItem) => r.abstract),
                relevance_score: sortedResults.map((r: ResultItem) => r.score)
            });
        } catch (error) {
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
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter keywords to search..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <Search className="h-4 w-4" />
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Precision-Recall Balance: {precisionRecall.toFixed(2)}
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

            {results && apiResponse && (
                <div className="space-y-4">
                    {results.abstract.map((text, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600" dir="auto">{text}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <p className="text-xs text-gray-500 mb-1">Relevance Score</p>
                                            <div
                                                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                                                style={{backgroundColor: getRelevanceColor(results.relevance_score[index])}}
                                            >
                                                {(results.relevance_score[index] * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <p className="text-xs text-gray-500 mb-1">Degree Between Vectors</p>
                                            <div
                                                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                                                style={{backgroundColor: getRelevanceColor(apiResponse.results.degree_between[index] / 100)}}
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
            )}
        </div>
    );
};

export default SearchResults;
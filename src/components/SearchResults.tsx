import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Download,
    Copy,
    Share2,
    History,
    Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResults {
    abstract: string[];
    relevance_score: number[];
}

interface ResultItem {
    abstract: string;
    score: number;
}

interface SearchHistoryItem {
    keyword: string;
    timestamp: string;
    resultCount: number;
}

const SearchResults: React.FC = () => {
    const [keyword, setKeyword] = useState<string>('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [precisionRecall, setPrecisionRecall] = useState<number>(0.5);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
    const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list');
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

    const LoadingSkeleton: React.FC = () => (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg" />
                </div>
            ))}
        </div>
    );

    const getRelevanceColor = (score: number): string => {
        const red = Math.floor(255 * (1 - score));
        const green = Math.floor(255 * score);
        return `rgb(${red}, ${green}, 0)`;
    };

    const handleSearch = useCallback(async (): Promise<void> => {
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

            const sortedResults = results.sort(
                (a: { score: number }, b: { score: number }) => b.score - a.score
            );

            setResults({
                abstract: sortedResults.map((r: ResultItem) => r.abstract),
                relevance_score: sortedResults.map((r: ResultItem) => r.score)
            });

            handleSaveSearch();
        } catch (error) {
            setError('Search failed. Please try again.');
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    }, [keyword, precisionRecall]);

    const handleSaveSearch = (): void => {
        if (!keyword.trim()) return;

        const newHistory: SearchHistoryItem = {
            keyword,
            timestamp: new Date().toISOString(),
            resultCount: results?.abstract.length || 0
        };

        setSearchHistory(prev => [newHistory, ...prev].slice(0, 10));
    };

    const handleClearHistory = (): void => {
        setSearchHistory([]);
        setIsHistoryOpen(false);
    };

    const handleHistoryItemClick = (item: SearchHistoryItem): void => {
        setKeyword(item.keyword);
        setIsHistoryOpen(false);
        void handleSearch();
    };

    const handleCopyAbstract = async (text: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const handleCopyLink = async (): Promise<void> => {
        try {
            const searchParams = new URLSearchParams({
                q: keyword,
                pr: precisionRecall.toString()
            });
            await navigator.clipboard.writeText(
                `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`
            );
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleExportResults = (): void => {
        if (!results) return;

        const csvContent = results.abstract.map((text, index) => ({
            abstract: text,
            relevance_score: results.relevance_score[index],
            degree: apiResponse.results.degree_between[index]
        }));

        const csvString = [
            ['Abstract', 'Relevance Score', 'Vector Angle'],
            ...csvContent.map(row => [
                `"${row.abstract.replace(/"/g, '""')}"`,
                row.relevance_score.toFixed(4),
                row.degree.toFixed(2)
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `search_results_${new Date().toISOString()}.csv`;
        link.click();
    };


    useEffect(() => {
        const search = async (): Promise<void> => {
            if (keyword.trim()) {
                await handleSearch();
            }
        };
        void search();
    }, [precisionRecall, handleSearch]);

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-3xl font-bold text-gray-800">Patent Search</h1>
                        <p className="text-sm text-gray-600">Search through patents using natural language</p>
                    </div>
                    <div className="flex gap-2">
                        <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <History className="w-4 h-4 mr-2" />
                                    History
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Search History</SheetTitle>
                                    <SheetDescription>Your recent searches (last 10)</SheetDescription>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(100vh-200px)] mt-4">
                                    {searchHistory.length > 0 ? (
                                        <div className="space-y-2">
                                            {searchHistory.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                    onClick={() => handleHistoryItemClick(item)}
                                                >
                                                    <div>
                                                        <p className="font-medium">{item.keyword}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(item.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {item.resultCount} results
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 mt-8">
                                            No search history
                                        </div>
                                    )}
                                </ScrollArea>
                                <SheetFooter className="mt-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleClearHistory}
                                        disabled={searchHistory.length === 0}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear History
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Search Controls */}
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
                            onClick={() => void handleSearch()}
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

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Results Section */}
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    results && apiResponse && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Found {results.abstract.length} results
                                </div>
                            </div>

                            <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'list' | 'grid')}>
                                <div className="flex items-center justify-between mb-4">
                                    <TabsList>
                                        <TabsTrigger value="list">List View</TabsTrigger>
                                        <TabsTrigger value="grid">Grid View</TabsTrigger>
                                    </TabsList>

                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    Share
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={handleCopyLink}>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Link
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleExportResults}>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Export as CSV
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <TabsContent value="list">
                                    <div className="space-y-6">
                                        {results.abstract.map((text, index) => (
                                            <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs text-gray-500">#{index + 1}</span>
                                                                <Badge variant="secondary">
                                                                    Score: {(results.relevance_score[index] * 100).toFixed(0)}%
                                                                </Badge>
                                                            </div>
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
                                                                <p className="text-xs text-gray-500 mb-1">Vector Angle</p>
                                                                <div
                                                                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-inner transition-colors"
                                                                    style={{
                                                                        backgroundColor: getRelevanceColor(
                                                                            apiResponse.results.degree_between[index] / 100
                                                                        )
                                                                    }}
                                                                >
                                                                    {apiResponse.results.degree_between[index].toFixed(0)}°
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCopyAbstract(text)}
                                                        className="mt-4"
                                                    >
                                                        <Copy className="w-4 h-4 mr-2" />
                                                        Copy
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="grid">
                                    <div className="grid grid-cols-2 gap-6">
                                        {results.abstract.map((text, index) => (
                                            <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">#{index + 1}</span>
                                                            <Badge variant="secondary">
                                                                Score: {(results.relevance_score[index] * 100).toFixed(0)}%
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopyAbstract(text)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-4" dir="auto">
                                                        {text}
                                                    </p>
                                                    <div className="flex justify-end gap-4 mt-2">
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <span>Vector Angle:</span>
                                                            <span className="font-medium">
                                {apiResponse.results.degree_between[index].toFixed(0)}°
                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SearchResults;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Mail, 
  Linkedin, 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  History,
  Settings2,
  Trash2,
  ChevronRight,
  Code2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { generateContent, ContentType, GenerationParams } from "@/src/services/geminiService";

interface HistoryItem {
  id: string;
  type: ContentType;
  prompt: string;
  result: string;
  timestamp: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ContentType>("email");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResult("");
    
    try {
      const params: GenerationParams = {
        type: activeTab,
        prompt,
        tone,
        length,
        additionalContext
      };
      
      const generated = await generateContent(params);
      setResult(generated || "Failed to generate content.");
      
      // Add to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        type: activeTab,
        prompt,
        result: generated || "",
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Generation error:", error);
      setResult("An error occurred during generation. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => setHistory([]);

  const loadFromHistory = (item: HistoryItem) => {
    setActiveTab(item.type);
    setPrompt(item.prompt);
    setResult(item.result);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">ContentAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
              Powered by Gemini
            </Badge>
            <Button variant="ghost" size="icon">
              <Settings2 className="w-5 h-5 text-zinc-500" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Create Content</CardTitle>
              <CardDescription>Select a format and describe what you need.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentType)} className="w-full">
                <TabsList className="grid grid-cols-3 w-full bg-zinc-100/50 p-1">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="linkedin" className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </TabsTrigger>
                  <TabsTrigger value="blog" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Blog</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea 
                    id="prompt"
                    placeholder={
                      activeTab === "email" ? "e.g. Write an email to a client following up on our last proposal..." :
                      activeTab === "linkedin" ? "e.g. Share my thoughts on the future of AI in marketing..." :
                      "e.g. Write a report on the latest trends in sustainable energy..."
                    }
                    className="min-h-[120px] resize-none focus-visible:ring-zinc-900"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger id="tone" className="focus:ring-zinc-900">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="witty">Witty</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Select value={length} onValueChange={(v) => setLength(v as any)}>
                      <SelectTrigger id="length" className="focus:ring-zinc-900">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Additional Context (Optional)</Label>
                  <Input 
                    id="context"
                    placeholder="e.g. Mention the 15% discount, use bullet points..."
                    className="focus-visible:ring-zinc-900"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white transition-all"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* History Section */}
          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-500" />
                <CardTitle className="text-sm font-medium">Recent History</CardTitle>
              </div>
              {history.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearHistory} className="h-8 w-8 text-zinc-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4 italic">No history yet.</p>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-2 rounded-md hover:bg-zinc-100 transition-colors group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex-shrink-0">
                          {item.type === "email" && <Mail className="w-3 h-3 text-blue-500" />}
                          {item.type === "linkedin" && <Linkedin className="w-3 h-3 text-sky-600" />}
                          {item.type === "blog" && <FileText className="w-3 h-3 text-emerald-500" />}
                        </div>
                        <p className="text-xs font-medium truncate text-zinc-700">{item.prompt}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isGenerating || result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col border-zinc-200 shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-zinc-50/50 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white text-[10px] uppercase tracking-wider font-mono">
                        {activeTab}
                      </Badge>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500 capitalize">{tone} tone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs gap-2"
                        onClick={copyToClipboard}
                        disabled={!result || isGenerating}
                      >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 overflow-y-auto">
                    {isGenerating ? (
                      <div className="p-8 space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="pt-4 space-y-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 prose prose-zinc max-w-none prose-sm sm:prose-base">
                        <div className="whitespace-pre-wrap font-sans text-zinc-800 leading-relaxed">
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                  <div className="relative group rounded-lg overflow-hidden my-6 border border-zinc-800 shadow-2xl">
                                    <div className="bg-zinc-800 px-4 py-1.5 flex items-center justify-between border-b border-zinc-700">
                                      <div className="flex items-center gap-2">
                                        <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                                        <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">
                                          {match[1]}
                                        </span>
                                      </div>
                                      <button 
                                        onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ""))}
                                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{
                                        margin: 0,
                                        padding: "1.5rem",
                                        fontSize: "0.875rem",
                                        lineHeight: "1.7",
                                        background: "#1e1e1e"
                                      }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className={`${className} bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded-md text-[0.9em] font-mono border border-zinc-200`} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              // Enhance other elements
                              h1: ({ children }) => <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-4 mt-8 first:mt-0">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mb-3 mt-6">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-lg font-medium tracking-tight text-zinc-900 mb-2 mt-4">{children}</h3>,
                              p: ({ children }) => <p className="text-zinc-700 leading-relaxed mb-4 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-4 text-zinc-700">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-zinc-700">{children}</ol>,
                              li: ({ children }) => <li className="pl-1">{children}</li>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-zinc-200 pl-4 italic text-zinc-600 my-6 bg-zinc-50 py-2 pr-4 rounded-r-lg">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {result}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {!isGenerating && result && (
                    <CardFooter className="border-t bg-zinc-50/30 py-3 flex justify-between items-center">
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Generated in {Math.floor(Math.random() * 2) + 1}s
                      </p>
                      <div className="flex gap-2">
                         {/* Placeholder for future actions */}
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50"
              >
                <div className="text-center space-y-4 max-w-sm">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-zinc-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-zinc-900">Ready to create?</h3>
                    <p className="text-sm text-zinc-500">
                      Fill out the form on the left to generate high-quality content for your business or personal brand.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-400">
            © 2026 ContentAI Assistant. Built with Gemini 3.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Sparkles, FileText, Search, Image as ImageIcon, Download, RefreshCw, ChevronRight, PenTool, Mail, Hash, TrendingUp, Palette, ChevronLeft } from 'lucide-react'
import { callAIAgent } from '@/lib/aiAgent'

const THEME_VARS = {
  '--background': '30 40% 98%',
  '--foreground': '20 40% 10%',
  '--card': '30 40% 96%',
  '--card-foreground': '20 40% 10%',
  '--primary': '24 95% 53%',
  '--primary-foreground': '30 40% 98%',
  '--secondary': '30 35% 92%',
  '--secondary-foreground': '20 40% 15%',
  '--accent': '12 80% 50%',
  '--accent-foreground': '30 40% 98%',
  '--muted': '30 30% 90%',
  '--muted-foreground': '20 25% 45%',
  '--border': '30 35% 88%',
  '--input': '30 30% 80%',
  '--ring': '24 95% 53%',
} as React.CSSProperties

// Agent IDs
const MANAGER_AGENT_ID = '698e0b61a7eb0a142757a2e8'
const CONTENT_WRITER_ID = '698e0b170f1d9d4090b519bc'
const SEO_ANALYST_ID = '698e0b2d76b1a8ab8e635751'
const GRAPHICS_DESIGNER_ID = '698e0b44ad038861b82558cd'

interface ContentWriterResponse {
  blog_post?: string
  social_media_posts?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  email_content?: {
    subject_line?: string
    preview_text?: string
    body?: string
  }
  key_messages?: string[]
  cta_recommendations?: string[]
}

interface SEOAnalystResponse {
  primary_keywords?: string[]
  secondary_keywords?: string[]
  meta_title?: string
  meta_description?: string
  heading_structure?: {
    h1?: string
    h2_suggestions?: string[]
    h3_suggestions?: string[]
  }
  readability_score?: string
  seo_score?: number
  optimization_recommendations?: string[]
  internal_link_suggestions?: string[]
  content_improvements?: string[]
}

interface GraphicsDesignerResponse {
  blog_header?: string
  social_graphics?: {
    linkedin_graphic?: string
    twitter_graphic?: string
    facebook_graphic?: string
    instagram_graphic?: string
  }
  promotional_banner?: string
  design_rationale?: string
  color_palette?: string[]
}

interface CampaignResult {
  content?: ContentWriterResponse
  seo?: SEOAnalystResponse
  graphics?: GraphicsDesignerResponse
  graphicsImages?: string[]
  timestamp?: string
  topic?: string
}

interface CampaignHistory {
  id: string
  topic: string
  timestamp: string
  qualityScore: number
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-semibold text-sm mt-3 mb-1">
              {line.slice(4)}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-semibold text-base mt-3 mb-1">
              {line.slice(3)}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-bold text-lg mt-4 mb-2">
              {line.slice(2)}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-4 list-disc text-sm">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-4 list-decimal text-sm">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-1" />
        return (
          <p key={i} className="text-sm">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

export default function Home() {
  const [sampleMode, setSampleMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'results'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Form state
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('B2B')
  const [contentTypes, setContentTypes] = useState<string[]>(['Blog', 'Social'])
  const [brandVoice, setBrandVoice] = useState('Professional')

  // Results state
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null)
  const [campaignHistory, setCampaignHistory] = useState<CampaignHistory[]>([])

  // Load sample data when sample mode is enabled
  useEffect(() => {
    if (sampleMode) {
      setTopic('AI-Powered Marketing Automation Platform Launch')
      setAudience('B2B')
      setContentTypes(['Blog', 'Social', 'Email'])
      setBrandVoice('Professional')

      // Set sample campaign results
      setCampaignResult({
        topic: 'AI-Powered Marketing Automation Platform Launch',
        timestamp: new Date().toISOString(),
        content: {
          blog_post: '# Revolutionize Your Marketing with AI Automation\n\n## Transform Your Campaigns\n\nDiscover how AI-powered automation can **boost your ROI** by 300% while reducing manual work by 80%.\n\n### Key Benefits\n\n- Automated content generation\n- Real-time performance analytics\n- Predictive customer insights\n- Seamless integration with existing tools\n\n### Get Started Today\n\nOur platform makes it easy to implement AI-driven marketing strategies that deliver measurable results.',
          social_media_posts: {
            linkedin: 'Excited to announce our AI-Powered Marketing Automation Platform! Transform your campaigns with intelligent automation. Join 10,000+ marketers already seeing 3x ROI improvements. Learn more: [link]',
            twitter: 'Marketing automation just got smarter. Our AI platform reduces manual work by 80% while boosting ROI by 300%. The future of marketing is here. #MarketingAI #Automation',
            facebook: 'Big news for marketers! We\'re launching an AI-powered platform that makes marketing automation effortless. Get real-time insights, automated content, and predictive analytics all in one place. Limited early access available!',
            instagram: 'The future of marketing is intelligent, automated, and incredibly powerful. Our new AI platform is changing the game for 10,000+ marketers worldwide. Swipe to see what\'s possible. Link in bio!'
          },
          email_content: {
            subject_line: 'Your Marketing Just Got 10x Smarter',
            preview_text: 'Introducing AI automation that actually works',
            body: 'Hi there,\n\nWe\'re thrilled to introduce our new AI-Powered Marketing Automation Platform.\n\n**What makes it special?**\n- 300% average ROI increase\n- 80% reduction in manual tasks\n- Real-time predictive insights\n\nEarly adopters are seeing incredible results. Join them today.\n\nBest regards,\nThe Team'
          },
          key_messages: [
            'AI automation increases ROI by 300%',
            'Reduce manual marketing work by 80%',
            'Real-time predictive analytics',
            'Seamless integration with existing tools',
            'Join 10,000+ successful marketers'
          ],
          cta_recommendations: [
            'Start Your Free Trial',
            'Schedule a Demo',
            'Download the Guide',
            'Join the Waitlist',
            'Get Early Access'
          ]
        },
        seo: {
          primary_keywords: ['AI marketing automation', 'marketing automation platform', 'AI-powered marketing'],
          secondary_keywords: ['marketing ROI', 'automated content', 'predictive analytics', 'marketing tools'],
          meta_title: 'AI Marketing Automation Platform | Boost ROI by 300%',
          meta_description: 'Transform your marketing with AI-powered automation. Join 10,000+ marketers achieving 300% ROI increases with intelligent campaign management and predictive insights.',
          heading_structure: {
            h1: 'AI-Powered Marketing Automation Platform',
            h2_suggestions: [
              'Transform Your Marketing Campaigns',
              'Key Features and Benefits',
              'Success Stories from Leading Brands',
              'Get Started in Minutes'
            ],
            h3_suggestions: [
              'Automated Content Generation',
              'Real-Time Analytics Dashboard',
              'Predictive Customer Insights',
              'Integration Capabilities'
            ]
          },
          readability_score: 'Good - Flesch Score 65 (College level)',
          seo_score: 87,
          optimization_recommendations: [
            'Add internal links to product pages',
            'Include more long-tail keyword variations',
            'Optimize image alt text for key terms',
            'Add FAQ schema markup'
          ],
          internal_link_suggestions: [
            'Link to pricing page from CTA sections',
            'Reference case studies in benefits section',
            'Connect to product documentation',
            'Link to comparison pages'
          ],
          content_improvements: [
            'Add more specific statistics and data points',
            'Include customer testimonials',
            'Expand on integration capabilities',
            'Add video content for engagement'
          ]
        },
        graphics: {
          blog_header: 'Modern gradient design featuring AI neural network visualization with brand colors, marketing icons, and clean typography displaying "AI-Powered Marketing Automation"',
          social_graphics: {
            linkedin_graphic: 'Professional 1200x627px graphic with statistics overlay (300% ROI) on gradient background',
            twitter_graphic: 'Bold 1200x675px design with key benefit callouts and platform preview',
            facebook_graphic: 'Engaging 1200x630px visual with customer success metrics and CTA',
            instagram_graphic: 'Square 1080x1080px vibrant design with feature highlights and brand aesthetic'
          },
          promotional_banner: 'Dynamic 728x90px banner with animated elements showcasing AI automation in action',
          design_rationale: 'The design system uses warm gradients (sunset orange to coral) to convey innovation and energy. Neural network patterns represent AI intelligence while maintaining professional aesthetics for B2B audience. Typography is bold and modern, ensuring readability across all platforms.',
          color_palette: ['#FF6B35', '#F7931E', '#FDC830', '#4ECDC4', '#1A535C']
        },
        graphicsImages: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop'
        ]
      })

      setCampaignHistory([
        { id: '1', topic: 'AI-Powered Marketing Automation Platform Launch', timestamp: new Date().toISOString(), qualityScore: 87 },
        { id: '2', topic: 'Summer Product Launch Campaign', timestamp: new Date(Date.now() - 86400000).toISOString(), qualityScore: 82 },
        { id: '3', topic: 'Customer Success Stories Series', timestamp: new Date(Date.now() - 172800000).toISOString(), qualityScore: 91 }
      ])

      setCurrentScreen('results')
    } else {
      setTopic('')
      setAudience('B2B')
      setContentTypes(['Blog', 'Social'])
      setBrandVoice('Professional')
      setCampaignResult(null)
      setCampaignHistory([])
      setCurrentScreen('dashboard')
    }
  }, [sampleMode])

  const handleGenerateCampaign = async () => {
    if (!topic.trim()) return

    setLoading(true)
    setActiveAgentId(MANAGER_AGENT_ID)

    try {
      const campaignBrief = `Create a comprehensive marketing campaign for: ${topic}

Target Audience: ${audience}
Content Types: ${contentTypes.join(', ')}
Brand Voice: ${brandVoice}

Please create:
1. Blog post and social media content
2. SEO optimization analysis
3. Marketing graphics and visuals`

      const result = await callAIAgent(campaignBrief, MANAGER_AGENT_ID)

      console.log('=== FULL MANAGER RESPONSE ===')
      console.log('Success:', result.success)
      console.log('Response.result:', result?.response?.result)
      console.log('Module outputs:', result?.module_outputs)
      console.log('Raw response (first 500 chars):', result?.raw_response?.substring(0, 500))

      if (result.success) {
        // Manager returns: result.response.result.content_writer, result.response.result.seo_analyst, result.response.result.graphics_designer
        const managerResult = result?.response?.result || {}

        // Extract sub-agent responses
        const contentData: ContentWriterResponse = managerResult?.content_writer || {}
        const seoData: SEOAnalystResponse = managerResult?.seo_analyst || {}
        const graphicsData: GraphicsDesignerResponse = managerResult?.graphics_designer || {}

        console.log('=== EXTRACTED DATA ===')
        console.log('Content Writer data available:', !!contentData?.blog_post)
        console.log('SEO data available:', !!seoData?.seo_score)
        console.log('Graphics data available:', !!graphicsData?.blog_header)

        // Extract images from module_outputs (top-level, from Graphics Designer)
        const graphicsImages = Array.isArray(result?.module_outputs?.artifact_files)
          ? result.module_outputs.artifact_files.map((f: any) => f?.file_url).filter(Boolean)
          : []

        console.log('Graphics images found:', graphicsImages.length, graphicsImages)

        const newCampaign: CampaignResult = {
          content: contentData,
          seo: seoData,
          graphics: graphicsData,
          graphicsImages,
          timestamp: new Date().toISOString(),
          topic
        }

        setCampaignResult(newCampaign)

        // Add to history
        const seoScore = typeof seoData?.seo_score === 'number' ? seoData.seo_score : 75
        setCampaignHistory(prev => [{
          id: Date.now().toString(),
          topic,
          timestamp: new Date().toISOString(),
          qualityScore: seoScore
        }, ...prev])

        setCurrentScreen('results')
      } else {
        console.error('=== AGENT CALL FAILED ===')
        console.error('Error:', result.error)
        console.error('Details:', result.details)
      }
    } catch (error) {
      console.error('Campaign generation error:', error)
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }

  const toggleContentType = (type: string) => {
    setContentTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div style={THEME_VARS} className="min-h-screen bg-gradient-to-br from-[hsl(30,50%,97%)] via-[hsl(20,45%,95%)] via-[hsl(40,40%,96%)] to-[hsl(15,35%,97%)]">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Marketing Command Center</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Campaign Generation</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-mode" className="text-sm text-foreground">Sample Data</Label>
                <Switch
                  id="sample-mode"
                  checked={sampleMode}
                  onCheckedChange={setSampleMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar - Campaign History */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-12'}`}>
          <Card className="h-full bg-card/80 backdrop-blur-sm border-border rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {sidebarOpen && (
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Campaign History
                  </CardTitle>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-8 w-8 p-0"
                >
                  {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            {sidebarOpen && (
              <CardContent>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-3">
                    {campaignHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No campaigns yet</p>
                    ) : (
                      campaignHistory.map(campaign => (
                        <Card
                          key={campaign.id}
                          className="p-3 hover:bg-secondary/50 cursor-pointer transition-colors border-border"
                        >
                          <div className="space-y-2">
                            <p className="text-sm font-medium line-clamp-2">{campaign.topic}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(campaign.timestamp).toLocaleDateString()}
                              </span>
                              <Badge className={`${getSEOScoreColor(campaign.qualityScore)} text-white text-xs`}>
                                {campaign.qualityScore}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Main Area */}
        <div className="flex-1">
          {currentScreen === 'dashboard' ? (
            /* Dashboard Screen */
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <PenTool className="w-6 h-6 text-primary" />
                    Create New Campaign
                  </CardTitle>
                  <CardDescription>Generate comprehensive marketing content with AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Topic Input */}
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium">Campaign Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., AI-Powered Marketing Automation Platform Launch"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-background border-input rounded-lg"
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label htmlFor="audience" className="text-sm font-medium">Target Audience</Label>
                    <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger id="audience" className="bg-background border-input rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="B2C">B2C</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Content Types */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Content Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Blog', 'Social', 'Email', 'Ad Copy'].map(type => (
                        <Badge
                          key={type}
                          variant={contentTypes.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer px-3 py-1.5 hover:bg-primary/90"
                          onClick={() => toggleContentType(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Brand Voice */}
                  <div className="space-y-2">
                    <Label htmlFor="voice" className="text-sm font-medium">Brand Voice</Label>
                    <Select value={brandVoice} onValueChange={setBrandVoice}>
                      <SelectTrigger id="voice" className="bg-background border-input rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Playful">Playful</SelectItem>
                        <SelectItem value="Authoritative">Authoritative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateCampaign}
                    disabled={loading || !topic.trim()}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg h-12 text-base font-semibold hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Campaign...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Campaign
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Templates */}
              <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Templates</CardTitle>
                  <CardDescription>Start with pre-configured campaign types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { title: 'Product Launch', audience: 'B2B', voice: 'Professional' },
                      { title: 'Seasonal Promotion', audience: 'B2C', voice: 'Playful' },
                      { title: 'Thought Leadership', audience: 'Technical', voice: 'Authoritative' },
                      { title: 'Customer Success Story', audience: 'General', voice: 'Casual' }
                    ].map((template, idx) => (
                      <Card
                        key={idx}
                        className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors border-border"
                        onClick={() => {
                          setTopic(template.title)
                          setAudience(template.audience)
                          setBrandVoice(template.voice)
                        }}
                      >
                        <h4 className="font-semibold text-sm mb-1">{template.title}</h4>
                        <p className="text-xs text-muted-foreground">{template.audience} • {template.voice}</p>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6">
              {/* Campaign Summary Header */}
              <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">{campaignResult?.topic}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{campaignResult?.timestamp ? formatTimestamp(campaignResult.timestamp) : ''}</span>
                        {typeof campaignResult?.seo?.seo_score === 'number' && (
                          <Badge className={`${getSEOScoreColor(campaignResult.seo.seo_score)} text-white`}>
                            SEO Score: {campaignResult.seo.seo_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2 rounded-lg border-border">
                        <Download className="w-4 h-4" />
                        Export All
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentScreen('dashboard')}
                        className="gap-2 rounded-lg border-border"
                      >
                        New Campaign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Tabs */}
              <Tabs defaultValue="content" className="space-y-4">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="content" className="gap-2 rounded-lg data-[state=active]:bg-card">
                    <FileText className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="gap-2 rounded-lg data-[state=active]:bg-card">
                    <Search className="w-4 h-4" />
                    SEO
                  </TabsTrigger>
                  <TabsTrigger value="graphics" className="gap-2 rounded-lg data-[state=active]:bg-card">
                    <ImageIcon className="w-4 h-4" />
                    Graphics
                  </TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  {/* Blog Post */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Blog Post
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-2 rounded-lg border-border">
                          <RefreshCw className="w-3 h-3" />
                          Regenerate
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="prose prose-sm max-w-none">
                          {renderMarkdown(campaignResult?.content?.blog_post ?? '')}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Social Media Posts */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        Social Media Posts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { platform: 'LinkedIn', content: campaignResult?.content?.social_media_posts?.linkedin },
                          { platform: 'Twitter', content: campaignResult?.content?.social_media_posts?.twitter },
                          { platform: 'Facebook', content: campaignResult?.content?.social_media_posts?.facebook },
                          { platform: 'Instagram', content: campaignResult?.content?.social_media_posts?.instagram }
                        ].map((item, idx) => (
                          <Card key={idx} className="p-4 border-border">
                            <h4 className="font-semibold text-sm mb-2">{item.platform}</h4>
                            <p className="text-sm text-foreground/90">{item.content ?? ''}</p>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Email Content */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Email Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Subject Line</Label>
                        <p className="font-semibold">{campaignResult?.content?.email_content?.subject_line ?? ''}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Preview Text</Label>
                        <p className="text-sm text-muted-foreground">{campaignResult?.content?.email_content?.preview_text ?? ''}</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Email Body</Label>
                        <div className="text-sm">{renderMarkdown(campaignResult?.content?.email_content?.body ?? '')}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Messages & CTAs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base">Key Messages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(campaignResult?.content?.key_messages) &&
                            campaignResult.content.key_messages.map((msg, idx) => (
                              <Badge key={idx} variant="secondary" className="px-3 py-1.5">
                                {msg}
                              </Badge>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base">CTA Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(campaignResult?.content?.cta_recommendations) &&
                            campaignResult.content.cta_recommendations.map((cta, idx) => (
                              <Badge key={idx} className="bg-primary text-primary-foreground px-3 py-1.5">
                                {cta}
                              </Badge>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="space-y-4">
                  {/* SEO Score & Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className={`w-20 h-20 mx-auto rounded-full ${getSEOScoreColor(campaignResult?.seo?.seo_score ?? 0)} flex items-center justify-center mb-2`}>
                            <span className="text-2xl font-bold text-white">{campaignResult?.seo?.seo_score ?? 0}</span>
                          </div>
                          <p className="text-sm font-medium">SEO Score</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 mx-auto text-primary mb-2" />
                          <p className="text-sm font-medium">Readability</p>
                          <p className="text-xs text-muted-foreground mt-1">{campaignResult?.seo?.readability_score ?? 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Hash className="w-12 h-12 mx-auto text-primary mb-2" />
                          <p className="text-sm font-medium">Keywords</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(campaignResult?.seo?.primary_keywords?.length ?? 0) + (campaignResult?.seo?.secondary_keywords?.length ?? 0)} total
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Keywords */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Keywords</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Primary Keywords</Label>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(campaignResult?.seo?.primary_keywords) &&
                            campaignResult.seo.primary_keywords.map((keyword, idx) => (
                              <Badge key={idx} className="bg-primary text-primary-foreground px-3 py-1.5">
                                {keyword}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Secondary Keywords</Label>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(campaignResult?.seo?.secondary_keywords) &&
                            campaignResult.seo.secondary_keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="px-3 py-1.5">
                                {keyword}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meta Preview */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Meta Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                        <p className="text-primary text-lg font-medium mb-1">{campaignResult?.seo?.meta_title ?? ''}</p>
                        <p className="text-sm text-muted-foreground">{campaignResult?.seo?.meta_description ?? ''}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Heading Structure */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Heading Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">H1</Label>
                        <p className="text-base font-semibold">{campaignResult?.seo?.heading_structure?.h1 ?? ''}</p>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">H2 Suggestions</Label>
                        <ul className="space-y-1">
                          {Array.isArray(campaignResult?.seo?.heading_structure?.h2_suggestions) &&
                            campaignResult.seo.heading_structure.h2_suggestions.map((h2, idx) => (
                              <li key={idx} className="text-sm ml-4 list-disc">{h2}</li>
                            ))}
                        </ul>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">H3 Suggestions</Label>
                        <ul className="space-y-1">
                          {Array.isArray(campaignResult?.seo?.heading_structure?.h3_suggestions) &&
                            campaignResult.seo.heading_structure.h3_suggestions.map((h3, idx) => (
                              <li key={idx} className="text-sm ml-4 list-disc">{h3}</li>
                            ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Optimization Recommendations */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Optimization Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Recommendations</Label>
                        <ul className="space-y-2">
                          {Array.isArray(campaignResult?.seo?.optimization_recommendations) &&
                            campaignResult.seo.optimization_recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Internal Link Suggestions</Label>
                        <ul className="space-y-2">
                          {Array.isArray(campaignResult?.seo?.internal_link_suggestions) &&
                            campaignResult.seo.internal_link_suggestions.map((link, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                <span>{link}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Content Improvements</Label>
                        <ul className="space-y-2">
                          {Array.isArray(campaignResult?.seo?.content_improvements) &&
                            campaignResult.seo.content_improvements.map((imp, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{imp}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Graphics Tab */}
                <TabsContent value="graphics" className="space-y-4">
                  {/* Image Gallery */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-primary" />
                          Generated Graphics
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-2 rounded-lg border-border">
                          <RefreshCw className="w-3 h-3" />
                          Regenerate All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(campaignResult?.graphicsImages) && campaignResult.graphicsImages.length > 0 ? (
                          campaignResult.graphicsImages.map((imageUrl, idx) => (
                            <Card key={idx} className="overflow-hidden border-border">
                              <img
                                src={imageUrl}
                                alt={`Generated graphic ${idx + 1}`}
                                className="w-full h-48 object-cover"
                              />
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">Graphic {idx + 1}</p>
                                  <Button variant="outline" size="sm" className="gap-2 rounded-lg border-border">
                                    <Download className="w-3 h-3" />
                                    Download
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-12 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No graphics generated yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Design Descriptions */}
                  <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Design Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Blog Header</Label>
                        <p className="text-sm text-foreground/90">{campaignResult?.graphics?.blog_header ?? ''}</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Social Media Graphics</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { platform: 'LinkedIn', desc: campaignResult?.graphics?.social_graphics?.linkedin_graphic },
                            { platform: 'Twitter', desc: campaignResult?.graphics?.social_graphics?.twitter_graphic },
                            { platform: 'Facebook', desc: campaignResult?.graphics?.social_graphics?.facebook_graphic },
                            { platform: 'Instagram', desc: campaignResult?.graphics?.social_graphics?.instagram_graphic }
                          ].map((item, idx) => (
                            <Card key={idx} className="p-3 border-border">
                              <h4 className="text-xs font-semibold mb-1 text-muted-foreground">{item.platform}</h4>
                              <p className="text-sm">{item.desc ?? ''}</p>
                            </Card>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Promotional Banner</Label>
                        <p className="text-sm text-foreground/90">{campaignResult?.graphics?.promotional_banner ?? ''}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Design Rationale & Color Palette */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Palette className="w-4 h-4 text-primary" />
                          Design Rationale
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">{renderMarkdown(campaignResult?.graphics?.design_rationale ?? '')}</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur-sm border-border rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base">Color Palette</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 gap-2">
                          {Array.isArray(campaignResult?.graphics?.color_palette) &&
                            campaignResult.graphics.color_palette.map((color, idx) => (
                              <div key={idx} className="space-y-1">
                                <div
                                  className="w-full h-16 rounded-lg border border-border"
                                  style={{ backgroundColor: color }}
                                />
                                <p className="text-xs text-center font-mono">{color}</p>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Agent Status Footer */}
      <div className="fixed bottom-4 right-4 max-w-sm">
        <Card className="bg-card/95 backdrop-blur-md border-border rounded-xl shadow-lg">
          <CardContent className="pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Powered by AI Agents</p>
            <div className="space-y-1.5">
              {[
                { id: MANAGER_AGENT_ID, name: 'Campaign Manager', icon: Sparkles },
                { id: CONTENT_WRITER_ID, name: 'Content Writer', icon: PenTool },
                { id: SEO_ANALYST_ID, name: 'SEO Analyst', icon: Search },
                { id: GRAPHICS_DESIGNER_ID, name: 'Graphics Designer', icon: Palette }
              ].map(agent => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeAgentId === agent.id ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                  <agent.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{agent.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

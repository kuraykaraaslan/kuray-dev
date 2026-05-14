import axiosInstance from "@/libs/axios";
import HeadlessModal from "../../common/Modal";
import { useState } from "react";
import { useRouter } from "next/navigation";



export default function AIModal({ open, onClose }: { open: boolean, onClose: () => void }) {

    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()


    const generate = async () => {
        if (!prompt.trim()) return
        try {
            setLoading(true)
            const res = await axiosInstance.post('/api/dynamic-pages/generate', {
                prompt: prompt.trim(),
                save: true,
            })
            setLoading(false)
            const pageId = res.data.page?.dynamicPageId
            onClose()
            if (pageId) router.push(`/admin/pages/${pageId}`)
            else router.refresh()
        } catch (err: any) {
            console.error('AI generation failed:', err)
            setLoading(false)
        }
    }

    return (
        <HeadlessModal open={open} onClose={onClose}>
            <div
                className="w-full max-w-lg rounded-xl p-6 shadow-xl"
                style={{ backgroundColor: '#1f1d1d', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                <h2 className="text-lg font-semibold text-white mb-1">Generate Page with AI</h2>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Describe the page you want to create. The AI will pick the right blocks and fill them with content.
                </p>

                <textarea
                    className="w-full rounded-lg p-3 text-sm text-white resize-none outline-none focus:ring-1"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        minHeight: '120px',
                    }}
                    placeholder="e.g. A landing page for our BIM Management platform targeting construction companies. Include pricing, features, and a demo CTA."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />

                {loading && (
                    <p className="text-sm text-blue-400 mt-2">Generating page...</p>
                )}

                <div className="flex gap-3 mt-4 justify-end">
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={generate}
                        disabled={loading || !prompt.trim()}
                    >
                        {loading ? (
                            <>
                            <span className="loading loading-spinner loading-xs" />
                            Generating… 
                            </>
                        ) : (
                            'Generate & Save as Draft'
                        )}
                    </button>
                </div>
            </div>
        </HeadlessModal>
    )
}
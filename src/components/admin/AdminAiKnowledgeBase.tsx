import { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  Check,
  Eye,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';
import { DEFAULT_AI_KNOWLEDGE_BASE } from '../../config/clientConfig';
import type { AiKnowledgeBaseData } from '../../types/portfolio';

export function AdminAiKnowledgeBase() {
  const { aiKnowledge, theme } = useApp();
  const [form, setForm] = useState<AiKnowledgeBaseData>(aiKnowledge);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Inline Test AI Assistant State
  const [testPrompt, setTestPrompt] = useState('Who is Samia Sultana Bushra and what services does ARPHANIX offer?');
  const [testAnswer, setTestAnswer] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setForm(aiKnowledge);
  }, [aiKnowledge]);

  const setField = <K extends keyof AiKnowledgeBaseData>(key: K, val: AiKnowledgeBaseData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const invalidateServerCache = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await fetch('/api/ai/invalidate-cache', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // non-fatal
    }
  };

  const saveKnowledge = async (refreshServer: boolean) => {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const previousClean = { ...aiKnowledge };
      delete previousClean.previousSnapshotJson;
      delete previousClean.updatedAt;
      const previousSnapshotJson = JSON.stringify(previousClean).slice(0, 75000);

      const payload: AiKnowledgeBaseData = {
        ...form,
        assistantName: form.assistantName.trim() || 'ARPHANIX Assistant',
        versionNumber: (aiKnowledge.versionNumber || 1) + 1,
        previousSnapshotJson,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'ai_knowledge_base', 'main'), payload);
      if (refreshServer) {
        await invalidateServerCache();
      }

      setNotice(
        refreshServer
          ? 'AI Knowledge Base saved and pushed live to the Assistant immediately.'
          : 'AI Knowledge Base saved.'
      );
      setTimeout(() => setNotice(null), 4500);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'ai_knowledge_base/main');
      } catch {
        setError('Unable to save AI Knowledge Base. Check field sizes and Admin verification.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRestorePrevious = async () => {
    if (!aiKnowledge.previousSnapshotJson) {
      setError('No previous version snapshot available yet.');
      return;
    }
    try {
      const parsed = JSON.parse(aiKnowledge.previousSnapshotJson) as AiKnowledgeBaseData;
      const restored: AiKnowledgeBaseData = {
        ...DEFAULT_AI_KNOWLEDGE_BASE,
        ...parsed,
        versionNumber: (aiKnowledge.versionNumber || 1) + 1,
        previousSnapshotJson: aiKnowledge.previousSnapshotJson,
        updatedAt: serverTimestamp(),
      };
      setForm(restored);
      setSaving(true);
      await setDoc(doc(db, 'ai_knowledge_base', 'main'), restored);
      await invalidateServerCache();
      setNotice('Previous AI Knowledge Base version restored and activated.');
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setError('Failed to restore previous version.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearConfirmed = async () => {
    setShowClearConfirm(false);
    const previousClean = { ...aiKnowledge };
    delete previousClean.previousSnapshotJson;
    delete previousClean.updatedAt;

    const cleared: AiKnowledgeBaseData = {
      assistantName: form.assistantName || 'ARPHANIX Assistant',
      assistantRole: 'AI Portfolio & Client Guide',
      greetingMessage: 'How can I help you learn about this practice?',
      responseLanguage: 'Auto-detect',
      responseTone: 'Calm, concise, and helpful',
      mainResponsibilities: '',
      allowedTopics: '',
      avoidTopics: '',
      contactRecommendationBehavior: '',
      developerContactDetails: form.developerContactDetails || '',
      clientIdentityIntro: '',
      personalBackground: '',
      professionalBiography: '',
      educationQualifications: '',
      skillsExpertise: '',
      workExperience: '',
      servicesPricing: '',
      projectsPortfolio: '',
      businessInformation: '',
      achievements: '',
      contactInformation: '',
      faqs: '',
      customInstructions: '',
      additionalInformation: '',
      rawKnowledgeDocument: '',
      versionNumber: (aiKnowledge.versionNumber || 1) + 1,
      previousSnapshotJson: JSON.stringify(previousClean).slice(0, 75000),
      updatedAt: serverTimestamp(),
    };

    setSaving(true);
    try {
      setForm(cleared);
      await setDoc(doc(db, 'ai_knowledge_base', 'main'), cleared);
      await invalidateServerCache();
      setNotice('Knowledge base cleared (previous version retained for restore).');
    } catch {
      setError('Unable to clear knowledge base.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim() || testing) return;
    setTesting(true);
    setTestAnswer('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testPrompt.trim(),
          persona: 'concierge',
          mode: 'fast',
          bypassCache: true,
          sessionKey: `admin-test-${Date.now()}`,
        }),
      });

      if (!response.ok || !response.body) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Test request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';
        for (const block of blocks) {
          const lines = block.split('\n');
          let eventName = 'message';
          let dataLine = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            if (line.startsWith('data:')) dataLine += line.slice(5).trim();
          }
          if (!dataLine) continue;
          try {
            const payload = JSON.parse(dataLine);
            if (eventName === 'chunk' && payload.text) {
              acc += payload.text;
              setTestAnswer(acc);
            } else if (eventName === 'error' && payload.message) {
              setTestAnswer(`Error: ${payload.message}`);
            }
          } catch {}
        }
      }
    } catch (err) {
      setTestAnswer(err instanceof Error ? err.message : 'Test failed.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="pb-4 border-b space-y-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">AI Knowledge Base &amp; Personality</h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              Manage client-specific AI facts, pasted knowledge documents, and assistant personality independently from website pages.
            </p>
          </div>
          <div className="font-mono-tabular text-xs" style={{ color: 'var(--text-muted)' }}>
            Version {aiKnowledge.versionNumber || 1}
          </div>
        </div>

        {/* All 6 Required Action Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveKnowledge(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-surface)' }}
          >
            <Save className="w-4 h-4" />
            <span>Save Knowledge Base</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => void saveKnowledge(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: theme === 'dark' ? '#0A120F' : '#FAF8F3',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Update AI Knowledge'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Eye className="w-4 h-4" />
            <span>Preview AI Knowledge</span>
          </button>

          <button
            type="button"
            disabled={!aiKnowledge.previousSnapshotJson || saving}
            onClick={() => void handleRestorePrevious()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-40"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Previous Version</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer"
            style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)' }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Knowledge Base</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className="p-3.5 rounded-xl border flex items-center gap-2 text-sm"
          style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', backgroundColor: 'var(--bg-surface)' }}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div
          className="p-3.5 rounded-xl border text-sm"
          style={{ borderColor: 'var(--accent-highlight)', color: 'var(--accent-highlight)' }}
        >
          {error}
        </div>
      )}

      {/* Live Test AI Assistant Box */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-3"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">Test AI Assistant</h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Tests latest saved knowledge live
          </span>
        </div>
        <form onSubmit={handleTestAssistant} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Ask a test question..."
            className="flex-1 px-3.5 py-2.5 rounded-lg border text-sm"
            style={{
              backgroundColor: 'var(--bg-page)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={testing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 shrink-0"
            style={{
              backgroundColor: 'var(--accent-secondary)',
              color: '#FAF8F3',
            }}
          >
            <Play className="w-4 h-4" />
            <span>{testing ? 'Testing...' : 'Test AI Assistant'}</span>
          </button>
        </form>
        {testAnswer && (
          <div
            className="p-4 rounded-xl border text-sm whitespace-pre-wrap leading-relaxed"
            style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
          >
            {testAnswer}
          </div>
        )}
      </section>

      {/* AI Personality Settings */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">Client AI Personality Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KbInput label="Assistant Name *" value={form.assistantName} onChange={(v) => setField('assistantName', v)} />
          <KbInput label="Assistant Role" value={form.assistantRole} onChange={(v) => setField('assistantRole', v)} />
          <KbInput label="Preferred Response Language" value={form.responseLanguage} onChange={(v) => setField('responseLanguage', v)} />
          <KbInput label="Response Tone & Personality" value={form.responseTone} onChange={(v) => setField('responseTone', v)} />
        </div>
        <KbArea label="Greeting Message" value={form.greetingMessage} onChange={(v) => setField('greetingMessage', v)} rows={2} />
        <KbArea label="Main Responsibilities" value={form.mainResponsibilities} onChange={(v) => setField('mainResponsibilities', v)} rows={2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KbArea label="Topics It Can Answer" value={form.allowedTopics} onChange={(v) => setField('allowedTopics', v)} rows={3} />
          <KbArea label="Topics It Must Avoid" value={form.avoidTopics} onChange={(v) => setField('avoidTopics', v)} rows={3} />
        </div>
        <KbArea label="Contact Recommendation Behavior" value={form.contactRecommendationBehavior} onChange={(v) => setField('contactRecommendationBehavior', v)} rows={2} />
        <KbInput
          label="Developer Full Name, Brand & Website Link (shared ONLY if visitor asks who built the website)"
          value={form.developerContactDetails}
          onChange={(v) => setField('developerContactDetails', v)}
          placeholder="e.g. Full Name — WENDAXY | https://wendaxy.vercel.app"
        />
      </section>

      {/* Complete Knowledge Document Paste Area */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-3"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">Paste Complete Client Profile / AI Knowledge Document</h3>
          <span className="font-mono-tabular text-xs" style={{ color: 'var(--text-muted)' }}>
            {form.rawKnowledgeDocument.length.toLocaleString()} / 60,000 chars
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Paste an entire client dossier, markdown brief, or AI-generated knowledge profile here. Combined automatically with structured fields below.
        </p>
        <textarea
          rows={10}
          value={form.rawKnowledgeDocument}
          onChange={(e) => setField('rawKnowledgeDocument', e.target.value.slice(0, 60000))}
          placeholder="Paste full client profile, company dossier, pricing rules, or Q&A notes here..."
          className="w-full px-3.5 py-3 rounded-xl border text-sm font-mono-tabular"
          style={{
            backgroundColor: 'var(--bg-page)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
      </section>

      {/* Structured Client Knowledge Fields */}
      <section
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <h3 className="font-display text-lg font-semibold">Structured Client Knowledge Fields</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KbArea label="Client Identity & Introduction" value={form.clientIdentityIntro} onChange={(v) => setField('clientIdentityIntro', v)} rows={3} />
          <KbArea label="Personal Background" value={form.personalBackground} onChange={(v) => setField('personalBackground', v)} rows={3} />
          <KbArea label="Professional Biography" value={form.professionalBiography} onChange={(v) => setField('professionalBiography', v)} rows={3} />
          <KbArea label="Education & Qualifications" value={form.educationQualifications} onChange={(v) => setField('educationQualifications', v)} rows={3} />
          <KbArea label="Skills & Expertise" value={form.skillsExpertise} onChange={(v) => setField('skillsExpertise', v)} rows={3} />
          <KbArea label="Work Experience" value={form.workExperience} onChange={(v) => setField('workExperience', v)} rows={3} />
          <KbArea label="Services & Pricing" value={form.servicesPricing} onChange={(v) => setField('servicesPricing', v)} rows={3} />
          <KbArea label="Projects & Portfolio" value={form.projectsPortfolio} onChange={(v) => setField('projectsPortfolio', v)} rows={3} />
          <KbArea label="Business Information" value={form.businessInformation} onChange={(v) => setField('businessInformation', v)} rows={3} />
          <KbArea label="Achievements & Awards" value={form.achievements} onChange={(v) => setField('achievements', v)} rows={3} />
        </div>
        <KbArea label="Contact Information" value={form.contactInformation} onChange={(v) => setField('contactInformation', v)} rows={2} />
        <KbArea label="Frequently Asked Questions (FAQs)" value={form.faqs} onChange={(v) => setField('faqs', v)} rows={4} />
        <KbArea label="Custom Instructions" value={form.customInstructions} onChange={(v) => setField('customInstructions', v)} rows={3} />
        <KbArea label="Additional Information" value={form.additionalInformation} onChange={(v) => setField('additionalInformation', v)} rows={3} />
      </section>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowPreview(false)}>
          <div
            className="w-full max-w-3xl rounded-2xl border max-h-[85vh] flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <span className="font-display text-lg font-semibold">Compiled AI Knowledge Preview</span>
              <button type="button" onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-5 overflow-auto text-xs font-mono-tabular whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(
                {
                  assistantName: form.assistantName,
                  assistantRole: form.assistantRole,
                  responseLanguage: form.responseLanguage,
                  responseTone: form.responseTone,
                  mainResponsibilities: form.mainResponsibilities,
                  allowedTopics: form.allowedTopics,
                  avoidTopics: form.avoidTopics,
                  contactRecommendationBehavior: form.contactRecommendationBehavior,
                  clientIdentityIntro: form.clientIdentityIntro,
                  personalBackground: form.personalBackground,
                  professionalBiography: form.professionalBiography,
                  educationQualifications: form.educationQualifications,
                  skillsExpertise: form.skillsExpertise,
                  workExperience: form.workExperience,
                  servicesPricing: form.servicesPricing,
                  projectsPortfolio: form.projectsPortfolio,
                  businessInformation: form.businessInformation,
                  achievements: form.achievements,
                  contactInformation: form.contactInformation,
                  faqs: form.faqs,
                  customInstructions: form.customInstructions,
                  additionalInformation: form.additionalInformation,
                  rawKnowledgeDocument: form.rawKnowledgeDocument,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowClearConfirm(false)}>
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-semibold">Clear Knowledge Base?</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              This will clear all knowledge base fields and pasted documents. You can still use “Restore Previous Version” right after if needed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg border text-sm cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleClearConfirmed()}
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{ backgroundColor: 'var(--accent-highlight)', color: '#FFFFFF' }}
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KbInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
        style={{
          backgroundColor: 'var(--bg-page)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}

function KbArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
        style={{
          backgroundColor: 'var(--bg-page)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}

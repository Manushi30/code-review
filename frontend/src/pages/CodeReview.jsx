import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2, Upload } from 'lucide-react';
import { api } from '../api/client';
import './CodeReview.css';

const LANGUAGES = [
  { id: 'python', label: 'Python', monaco: 'python', ext: ['.py'] },
  { id: 'java', label: 'Java', monaco: 'java', ext: ['.java'] },
  { id: 'cpp', label: 'C++', monaco: 'cpp', ext: ['.cpp', '.cc'] },
];

const STARTERS = {
  python: '# Write your Python code here\ndef main():\n    print("Hello, student!")\n\nif __name__ == "__main__":\n    main()\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, student!");\n    }\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, student!" << endl;\n    return 0;\n}\n',
};

export default function CodeReview() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTERS.python);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIdsRef = useRef([]);

  const langConfig = LANGUAGES.find((l) => l.id === language);

  const clearIssueHighlights = () => {
    const editor = editorRef.current;
    if (!editor) return;
    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
  };

  const handleLanguageChange = (e) => {
    const id = e.target.value;
    setLanguage(id);
    setCode(STARTERS[id]);
    setResult(null);
    clearIssueHighlights();
  };

  const handleReview = async () => {
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await api.analyzeCode({ code, language });
      setResult(data);
    } catch (err) {
      setError(err.message);
      clearIssueHighlights();
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode(STARTERS[language]);
    setResult(null);
    setError('');
    clearIssueHighlights();
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const match = LANGUAGES.find((l) => l.ext.includes(ext));
    if (match) setLanguage(match.id);
    const reader = new FileReader();
    reader.onload = () => setCode(String(reader.result));
    reader.readAsText(file);
    e.target.value = '';
  };

  const getIssueSeverity = (issue) => (issue.severity || 'warning').toLowerCase();

  const focusIssueLine = (lineNumber) => {
    const editor = editorRef.current;
    if (!editor || !Number.isInteger(lineNumber) || lineNumber < 1) return;
    editor.revealLineInCenter(lineNumber);
    editor.setPosition({ lineNumber, column: 1 });
    editor.focus();
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!editor || !monaco || !model || !result?.analysis?.issues?.length) {
      clearIssueHighlights();
      return undefined;
    }

    const issueDecorations = result.analysis.issues
      .map((issue) => {
        const lineNumber = Number.parseInt(issue.lineNumber, 10);
        if (!Number.isInteger(lineNumber) || lineNumber < 1) return null;
        const severity = getIssueSeverity(issue);
        return {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: `code-review-line-highlight code-review-line-highlight-${severity}`,
            glyphMarginClassName: `code-review-glyph code-review-glyph-${severity}`,
            overviewRuler: {
              color: severity === 'error' ? '#e74c3c' : '#f39c12',
              position: monaco.editor.OverviewRulerLane.Right,
            },
          },
        };
      })
      .filter(Boolean);

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, issueDecorations);

    const markers = result.analysis.issues
      .map((issue) => {
        const lineNumber = Number.parseInt(issue.lineNumber, 10);
        if (!Number.isInteger(lineNumber) || lineNumber < 1) return null;
        const severity = getIssueSeverity(issue);
        return {
          severity:
            severity === 'error'
              ? monaco.MarkerSeverity.Error
              : severity === 'info'
                ? monaco.MarkerSeverity.Hint
                : monaco.MarkerSeverity.Warning,
          message: issue.description || issue.aiFeedback || issue.explanation || 'Code issue detected',
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        };
      })
      .filter(Boolean);

    monaco.editor.setModelMarkers(model, 'code-review', markers);

    return () => {
      monaco.editor.setModelMarkers(model, 'code-review', []);
    };
  }, [result, code, language]);

  const analysis = result?.analysis;
  const issues = analysis?.issues || [];

  return (
    <div className="review-layout">
      <h1 className="page-title">Code Review</h1>

      <div className="review-toolbar">
        <select value={language} onChange={handleLanguageChange} aria-label="Language">
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={handleReview} disabled={loading}>
          <Sparkles size={18} />
          {loading ? 'Analyzing...' : 'Review Code'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          <Trash2 size={18} /> Clear
        </button>
        <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>
          <Upload size={18} /> Upload File
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".py,.java,.cpp,.cc"
          hidden
          onChange={handleFile}
        />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="editor-panel glass-card">
        <Editor
          height="360px"
          language={langConfig?.monaco}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            monacoRef.current = monaco;
            if (result?.analysis?.issues?.length) {
              editor.focus();
            }
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            tabSize: 4,
            renderLineHighlight: 'all',
            glyphMargin: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="results-grid">
          <div className="score-panel glass-card">
            <p className="stat-label">Overall Score</p>
            <p className="score-ring">{result.review?.score ?? analysis?.overallScore}/100</p>
            <div className="breakdown-grid">
              {[
                ['Correctness', analysis?.breakdown?.correctness],
                ['Readability', analysis?.breakdown?.readability],
                ['Efficiency', analysis?.breakdown?.efficiency],
                ['Best Practices', analysis?.breakdown?.bestPractices],
              ].map(([label, val]) => (
                <div key={label} className="breakdown-item">
                  <span>{label}</span>
                  <strong>{val ?? '—'}</strong>
                </div>
              ))}
            </div>
            {analysis?.summary && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'left' }}>
                {analysis.summary}
              </p>
            )}
          </div>

          <div className="section-card glass-card" style={{ maxHeight: 420, overflow: 'auto' }}>
            <h3>Issues Found ({issues.length})</h3>
            {issues.length === 0 ? (
              <p>Great job! No major issues detected.</p>
            ) : (
              issues.map((issue, i) => {
                const lineNumber = Number.parseInt(issue.lineNumber, 10);
                const severity = getIssueSeverity(issue);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`issue-card issue-card-button issue-card-${severity}`}
                    onClick={() => focusIssueLine(lineNumber)}
                  >
                    <span className={`badge badge-${severity}`}>
                      {issue.severity} · Line {issue.lineNumber}
                    </span>
                    <h4>{issue.description}</h4>
                    <p style={{ fontSize: '0.85rem' }}>{issue.aiFeedback || issue.explanation}</p>
                    {issue.suggestedFix && (
                      <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        <strong>Fix:</strong> {issue.suggestedFix}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {result?.review?.improvedCode && (
        <div className="section-card glass-card">
          <h3>Improved Version</h3>
          <div className="compare-grid">
            <div>
              <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Original</p>
              <pre className="code-block">{code}</pre>
            </div>
            <div>
              <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Improved</p>
              <pre className="code-block">{result.review.improvedCode}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

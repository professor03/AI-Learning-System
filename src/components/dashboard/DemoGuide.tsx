import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { demoNote, demoQuiz, DEMO_NOTE_ID } from '../../lib/demo';
import { useAppStore } from '../../store/useAppStore';
import { useMemoryStore } from '../../store/useMemoryStore';

export default function DemoGuide() {
  const navigate = useNavigate();
  const loaded = useAppStore(state => state.notes.some(note => note.id === DEMO_NOTE_ID));
  const loadDemo = () => {
    const app = useAppStore.getState();
    if (!app.notes.some(note => note.id === DEMO_NOTE_ID)) app.addNote(demoNote);
    if (!app.quizzes[DEMO_NOTE_ID]) app.addQuiz(DEMO_NOTE_ID, demoQuiz);
    demoNote.terms.forEach(term => useMemoryStore.getState().addAtom({ ...term, sourceId: DEMO_NOTE_ID }));
  };
  return <Card className="border border-blue-100 bg-blue-50/60 space-y-3">
    <h2 className="text-xl font-bold text-gray-900">三分鐘體驗學習流程</h2>
    <p className="text-sm text-gray-600">載入預先編寫的堆疊與佇列教材，可體驗筆記、三題測驗與複習排程。這是離線示範，未呼叫 AI；LearnSight 需另外連接 YOLO 服務。</p>
    <div className="flex flex-wrap gap-2">
      <Button onClick={loadDemo}>{loaded ? '補齊示範資料' : '載入離線示範教材'}</Button>
      {loaded && <><Button variant="secondary" onClick={() => navigate(`/notes/${DEMO_NOTE_ID}`)}>閱讀示範筆記</Button>
        <Button variant="secondary" onClick={() => navigate(`/quiz/${DEMO_NOTE_ID}`)}>開始示範測驗</Button>
        <Button variant="secondary" onClick={() => navigate('/review')}>開始間隔複習</Button></>}
      <Button variant="ghost" onClick={() => navigate('/upload')}>使用自己的教材</Button>
    </div>
  </Card>;
}

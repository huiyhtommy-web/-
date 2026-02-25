/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Clipboard, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mic, 
  Table as TableIcon, 
  Users, 
  Phone, 
  Info,
  ChevronRight,
  Layout,
  Plus,
  Trash2,
  Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Stage, Layer, Rect, Text as KonvaText, Circle, Group } from 'react-konva';
import type { Stage as StageType } from 'konva/lib/Stage';

// --- Types ---

interface RundownItem {
  mins: number;
  duration: number;
  content: string;
  remarks: string;
}

interface DiscussionItem {
  col1: string; // Target / Category
  col2: string; // Difficulty
  col3: string; // Need
  col4: string; // Strength / Ideal
  col5?: string; // Action (Optional)
}

interface CourseData {
  title: string;
  rundown: RundownItem[];
  discussion?: DiscussionItem[];
  discussionTitle?: string;
  discussionHeaders?: string[];
}

interface FloorPlanItem {
  id: string;
  type: 'table' | 'chair' | 'projector' | 'mic' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  color: string;
  fontSize?: number;
}

// --- Database ---

const courseDatabase: Record<string, Record<number, CourseData>> = {
  A: {
    1: {
      title: "課程A（人口老化及長者照顧）第一節",
      rundown: [
        { mins: -40, duration: 40, content: "眾心行善計劃同工抵達學校\n同工到達禮堂，設置場地\n13:40 義工抵達學校及 Briefing\n14:10 同學抵達禮堂就座", remarks: "請校方預早設置桌椅和器材\n請老師幫忙安排同學坐於指定位置" },
        { mins: 0, duration: 5, content: "團隊及計劃介紹\n簡單講解課程內容", remarks: "物資：\n- PPT（明愛自備）\n- 咪 3支（學校）" },
        { mins: 5, duration: 5, content: "何謂義工？\n播放 Teaser 短片\n義工精神及價值\n義工服務的種類\n小善幸/微義工\n優質義工特性", remarks: "物資：\n- PPT、咪" },
        { mins: 10, duration: 5, content: "認識長者\n播放影片\n帶出年老乃自然現象，同時會帶來一些新的生活狀況", remarks: "物資：\n- PPT、咪" },
        { mins: 15, duration: 25, content: "體驗活動\n5班各自在不同禮堂區域進行體驗活動：\n- 聽新聞 (耳罩) + 點餐 (眼罩)\n- 分藥 (手指關節限制裝備)\n- 走路 (駝背帶)\n體驗活動完結後，每個活動的主持進行簡單解說。解說完結後，同學返回原始座位就坐。\n活動時思考：長者面對甚麼困難及感受", remarks: "物資（明愛自備）：\n- 隨身咪 4支\n【點餐】眼罩、點餐紙、筆\n【聽新聞】耳罩、新聞紙、問題表\n【走路】駝背帶、椅子、雪糕筒\n【分藥】關節限制裝備、藥盒、藥袋" },
        { mins: 40, duration: 15, content: "大型活動解說及反思（每區邀請1位同學）\n長者有甚麼需要？\n生活中的小善幸", remarks: "物資：\n- PPT、咪" },
        { mins: 55, duration: 5, content: "活動總結\n介紹小善幸任務(一)：填寫心意卡\n簡介 LMS（操作步驟＋出色例子）及嘉許/獎勵計劃", remarks: "物資：\n- 心意卡（每位同學獲發1張）\n- LMS QR code" },
        { mins: 60, duration: 20, content: "同工及義工收拾場地\n活動解說及解散", remarks: "" },
      ],
      discussionTitle: "體驗活動指引",
      discussionHeaders: ["參與學生", "體驗活動", "指引"],
      discussion: [
        { col1: "5B", col2: "分藥", col3: "兩位同學一組，獲發一個藥盒及三包藥。同學互助讓每人其中一隻手帶上手腕套。同學分工合作，根據藥袋指示將珠子放到藥盒相應藥格。", col4: "解說：體驗長者手指機能退化，願意主動幫助。" },
        { col1: "5A + 5D", col2: "聽新聞", col3: "兩位同學一組，同學A戴上耳罩。同學B扮演家人讀出新聞並詢問三條問題。完成後交換。", col4: "解說：體驗長者聽力退力，願意有耐性地溝通。" },
        { col1: "5C", col2: "走路", col3: "所有學生分為2-3人一組，每組安排1人穿上駝背帶於既定路線行走。其他組員協助扶持。", col4: "解說：體驗長者身體機能退化，願意主動幫助。" },
        { col1: "5E + 5F", col2: "點餐", col3: "兩位同學一組，同學B戴上眼罩。同學A讀出點心名稱，讓同學B協助點餐並在點心紙上剔選。", col4: "解說：體驗長者視力退化，願意主動幫助。" }
      ]
    },
    2: {
      title: "課程A（人口老化及長者照顧）第二節",
      rundown: [
        { mins: -20, duration: 20, content: "眾心行善計劃同工抵達學校\n同工到達禮堂，設置場地", remarks: "請校方預早設置桌椅和器材\n請學校同工協助安排同學就座" },
        { mins: 0, duration: 5, content: "課堂重溫及回顧\n分享小善幸\n強調優質義工特質", remarks: "物資：\n- PPT、咪" },
        { mins: 5, duration: 10, content: "構思·服務·領悟\n認識服務框架", remarks: "物資：\n- PPT、咪" },
        { mins: 15, duration: 35, content: "長者的困難和需要\n播放長者影片，邀請同學找出她們的困難和需要\n同學輪流思考個人強項，構思小善幸以關懷片段中的長者\n每張枱分兩組進行\n同學分享組內構思的小善幸例子", remarks: "物資：\n- PPT、咪\n- 工作紙、Marker" },
        { mins: 50, duration: 10, content: "活動總結\n介紹小善幸任務(二)：善幸日誌\n提醒 LMS 及獎勵計劃", remarks: "物資：\n- 善幸日誌" },
        { mins: 60, duration: 20, content: "同工收拾場地\n活動解說及解散", remarks: "" },
      ],
      discussionTitle: "小組討論活動指引",
      discussionHeaders: ["短片", "困難", "需要", "強項例子", "小善幸例子"],
      discussion: [
        { col1: "惠萍婆婆", col2: "丈夫入院孤單、不開心、行動不便", col3: "希望能與伴侶見面、他人的關心、購買日常用品", col4: "懂得視像對話、有同理心、體力充足", col5: "教導視像對話、寫心意卡、協助購物" },
        { col1: "淑賢婆婆", col2: "不懂操作智能電話、感覺疏離、身體痛症", col3: "使用智能電話接觸外界資訊、紓緩痛症", col4: "擅長操作手機、能做運動", col5: "教導使用智能電話、一起做伸展運動" },
        { col1: "葉婆婆", col2: "患認知障礙症、善忘、未能自理", col3: "鍛練大腦、生活提示以協助自主生活", col4: "擅長玩桌遊、擅長美術設計", col5: "教導玩桌遊、製作精美提示卡" },
        { col1: "玉香婆婆", col2: "收入不足、居住狹窄、膳食營養不足", col3: "足夠生活空間、從飲食吸收足夠營養", col4: "懂得收納術、家中有餘糧", col5: "協助整理雜物、捐贈營養食物" }
      ]
    },
    3: {
      title: "課程A（人口老化及長者照顧）第三節",
      rundown: [
        { mins: -15, duration: 15, content: "眾心行善計劃同工抵達學校\n設置場地\n義工抵達學校及 Briefing", remarks: "由校方設置場地及器材\n請學校同工協助安排同學就座" },
        { mins: 0, duration: 10, content: "課程重溫及回顧\n分享小善幸\n強調優質義工特質", remarks: "物資：\n- iPad、善幸日誌、PPT、咪" },
        { mins: 10, duration: 10, content: "考考你\n有關長者的問答題", remarks: "物資：\n- PPT、咪" },
        { mins: 20, duration: 5, content: "可持續發展目標\n介紹「可持續發展目標」", remarks: "物資：\n- PPT、咪" },
        { mins: 25, duration: 10, content: "設計「長者友善地圖」\n從圖片中找出長者於社區生活中所面對的困難及需要\n透過文字/圖畫以顯示一個理想社區可以如何滿足上述的長者需要", remarks: "物資：\n- 畫紙、Marker、圖卡" },
        { mins: 35, duration: 10, content: "小組分享\n同學分享所構思的長者友善社區元素", remarks: "物資：\n- PPT、咪" },
        { mins: 45, duration: 5, content: "你想．理想可達到\n現時社區如何支援不同需要的長者", remarks: "物資：\n- PPT、咪" },
        { mins: 50, duration: 10, content: "活動總結\nLMS 獎勵計劃\n填寫網上問卷", remarks: "物資：\n- PPT、咪、iPad" },
        { mins: 60, duration: 20, content: "同工及義工收拾場地\n活動解說及解散", remarks: "" },
      ],
      discussionTitle: "「設計長者友善地圖」指引",
      discussionHeaders: ["類別", "困難", "需要", "理想社區"],
      discussion: [
        { col1: "交通", col2: "月台隙縫闊、綠燈短、巴士站字細無位坐", col3: "安全上落、充裕過路時間、大字、椅子、上蓋", col4: "收窄隙縫、延長綠燈、大顯示板、增設椅子上蓋" },
        { col1: "公共設施", col2: "樓梯長、行人路窄多雜物、斜路多", col3: "方便設施協助上落、安全暢通、省力", col4: "增設升降機、擴闊行人路、清理雜物、扶手欄杆" },
        { col1: "公園/醫院", col2: "欠缺上蓋遮蔭、欠缺椅子", col3: "遮蔭擋雨、休息", col4: "加設上蓋及椅子" },
        { col1: "商場", col2: "門重難開、地面濕滑、無位坐", col3: "省力開門、防滑、休息", col4: "自動門、防滑磚、加設椅子" }
      ]
    }
  },
  E: {
    1: {
      title: "課程A（環境與可持續發展義工服務）第一節",
      rundown: [
        { mins: -20, duration: 20, content: "眾心行善計劃同工抵達學校\n設置場地\n11:15義工抵達學校及Briefing\n11:25學生抵達禮堂就座", remarks: "由校方設置場地及器材\n請老師幫忙安排同學坐於指定桌子" },
        { mins: 0, duration: 10, content: "課堂簡介\n1. 何謂義工\n2. 主題引入 - 何謂環保\n3. 聯合國 - 可持續發展目標", remarks: "PPT、咪" },
        { mins: 10, duration: 15, content: "引入-環境污染的例子\n1. 香港海洋污染現況\n2. 體驗活動(1) - 海洋垃圾排次序\n3. 微塑膠危及生命安全", remarks: "「垃圾」圖片(A4, 過膠) 24套" },
        { mins: 25, duration: 15, content: "可持續發展–個人生活\n1. 日常生活與垃圾污染的關係\n2. 體驗活動(2)–環保小偵探", remarks: "環保樹 24張\nmarkers 96支" },
        { mins: 40, duration: 10, content: "環保小善幸 (個人層面)\n1. 邀請同學嘗試各種走塑行動\n2. 課堂總結", remarks: "" },
        { mins: 50, duration: 10, content: "簡介網上學習平台(LMS)\n* 簡介LMS（操作步驟＋出色例子）及嘉許/獎勵計劃", remarks: "LMS QR code 168張" },
        { mins: 60, duration: 15, content: "同工及義工收拾場地\n活動檢討及解散", remarks: "" },
      ]
    },
    2: {
      title: "課程A（環境及可持續發展）第二節",
      rundown: [
        { mins: -20, duration: 20, content: "場地設置\n分配物資及佈置場地\n11:35學生抵達禮堂就座", remarks: "由校方設置場地及器材\n請各老師幫忙安排同學坐於指定位置" },
        { mins: 0, duration: 15, content: "課堂回顧及分享\n1. 回顧第一節課堂\n2. 邀請分享優質小善幸並嘉許同學參與\n3. 提醒登入LMS的方法", remarks: "" },
        { mins: 15, duration: 10, content: "固體廢物來源\n1. 認識日常衣食住行會製造的垃圾\n* 播放影片A：固體廢物從何來\n2. 體驗活動 1：消失的垃圾？", remarks: "1. 影片A\n2. 海廢實物/圖片 24套\n3. 垃圾分解工作紙 24張" },
        { mins: 25, duration: 10, content: "如何處理固體廢物\n1. 認識現時香港處理固體廢物的方法\n* 固體廢物處理方法\n* 處理方法的缺點", remarks: "" },
        { mins: 35, duration: 15, content: "回收的重要性\n1. 認識回收分類\n2. 體驗活動 2：Fun分 Rubbish\n3. 回收前的準備工作", remarks: "1. 影片B\n2. 實體固體廢物 24套\n3. 回收處理影片 4段" },
        { mins: 50, duration: 5, content: "認識香港回收機構及設施\n* 簡介香港特定廢物回收商\n* 認識學校附近的回收點", remarks: "" },
        { mins: 55, duration: 5, content: "活動總結\n* 介紹小善幸任務(二)：善幸日誌\n* 簡介LMS獎勵計劃", remarks: "1. 善幸日誌工作紙 168張" },
        { mins: 60, duration: 15, content: "同工及義工收拾場地\n活動檢討及解散", remarks: "" },
      ]
    },
    3: {
      title: "課程A（環境及可持續發展）第三節",
      rundown: [
        { mins: -20, duration: 20, content: "場地設置\n1. 眾心行善計劃同工抵達學校\n2. 分配物資及佈置場地\n3. 簡介活動流程", remarks: "有勞校方預早設置桌椅和器材\n請各位老師幫忙安排同學坐於指定位置" },
        { mins: 0, duration: 10, content: "課堂回顧及分享\n1. LMS輸入小善行(如有需要)\n2. 回顧第二節課堂\n3. 邀請分享優質小善幸並嘉許同學參與", remarks: "" },
        { mins: 10, duration: 10, content: "認識空氣污染\n1. 何謂溫室氣體？\n2. 了解碳排放的影響", remarks: "播放影片A:何謂溫室氣體" },
        { mins: 20, duration: 10, content: "如何平衡社會發展及環境保護\n* 我們應如何的平衡社會發展及環境保護碳排放？\n* 介紹符合可持續發展原則\n* 認識碳中和", remarks: "" },
        { mins: 30, duration: 25, content: "建立可持續生活習慣\n體驗活動：減碳小先鋒！\n* 邀請同學從衣、食、住、行四方面思考減碳方法\n* 小組分享", remarks: "紙 24份\n筆 140支" },
        { mins: 55, duration: 5, content: "活動總結\n* 填寫LMS\n* 介紹LMS獎勵計劃", remarks: "PPT、咪" },
        { mins: 60, duration: 15, content: "同工及義工收拾場地\n活動檢討及解散", remarks: "" },
      ]
    }
  },
  B: { 1: { title: "課程B 第一節 (範本)", rundown: [] }, 2: { title: "課程B 第二節 (範本)", rundown: [] }, 3: { title: "課程B 第三節 (範本)", rundown: [] } },
  C: { 1: { title: "課程C 第一節 (範本)", rundown: [] }, 2: { title: "課程C 第二節 (範本)", rundown: [] }, 3: { title: "課程C 第三節 (範本)", rundown: [] } },
  D: { 1: { title: "課程D 第一節 (範本)", rundown: [] }, 2: { title: "課程D 第二節 (範本)", rundown: [] }, 3: { title: "課程D 第三節 (範本)", rundown: [] } }
};

// --- Helper Functions ---

const calculateTime = (baseTime: string, offsetMins: number) => {
  if (!baseTime) return "??:??";
  const [hours, minutes] = baseTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + offsetMins);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// --- Main Component ---

export default function App() {
  const [selectedTheme, setSelectedTheme] = useState('A');
  const [selectedSection, setSelectedSection] = useState(1);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<StageType>(null);
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: '2026-03-18',
    startTime: '14:00',
    endTime: '15:00',
    location: '活動室',
    staff: 'Tommy Sir',
    micCount: '3',
    tableCount: '6',
    chairCount: '190',
    staffContact: 'Tommy sir（9230-0127）',
    schoolContact: '王佩文主任',
    remarks: '請老師提醒同學穿著運動服',
  });

  const [classCounts, setClassCounts] = useState<Record<string, string>>({
    '5A': '27',
    '5B': '21',
    '5C': '19',
    '5D': '27',
    '5E': '27',
    '5F': '28',
  });

  const [floorPlanItems, setFloorPlanItems] = useState<FloorPlanItem[]>([
    { id: '1', type: 'table', x: 50, y: 50, label: '長枱 1', color: '#10b981' },
    { id: '2', type: 'table', x: 150, y: 50, label: '長枱 2', color: '#10b981' },
    { id: '3', type: 'projector', x: 100, y: 150, label: '投影機', color: '#3b82f6' },
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const totalStudentsData = useMemo(() => {
    const activeClasses = Object.entries(classCounts).filter(([_, count]) => count && !isNaN(Number(count)));
    const total = activeClasses.reduce((sum, [_, count]) => sum + Number(count), 0);
    const details = activeClasses.map(([name, count]) => `${name} ${count}`).join('、');
    return { total, details };
  }, [classCounts]);

  const currentCourse = courseDatabase[selectedTheme][selectedSection];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (className: string, value: string) => {
    setClassCounts(prev => ({ ...prev, [className]: value }));
  };

  const addFloorPlanItem = (type: FloorPlanItem['type']) => {
    const newItem: FloorPlanItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100,
      y: 100,
      width: type === 'table' ? 60 : type === 'projector' ? 30 : 20,
      height: type === 'table' ? 30 : type === 'projector' ? 30 : 20,
      label: type === 'table' ? '長枱' : type === 'chair' ? '' : type === 'projector' ? '投影機' : type === 'mic' ? '咪' : '文字',
      color: type === 'table' ? '#10b981' : type === 'chair' ? '#f59e0b' : type === 'projector' ? '#3b82f6' : type === 'mic' ? '#ef4444' : '#6b7280',
    };
    setFloorPlanItems([...floorPlanItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  const applyPreset = (presetType: 'grid' | 'columns') => {
    let newItems: FloorPlanItem[] = [];
    if (presetType === 'grid') {
      // Top row
      newItems.push({ id: 't1', type: 'table', x: 20, y: 10, width: 80, height: 30, label: '長枱', color: '#ffffff' });
      newItems.push({ id: 't2', type: 'table', x: 110, y: 10, width: 180, height: 30, label: '台（電腦設備）', color: '#ffffff' });
      newItems.push({ id: 't3', type: 'table', x: 300, y: 10, width: 80, height: 30, label: '長枱', color: '#ffffff' });

      const classes = [
        { name: '4A', rows: 3, students: [9, 9, 10], color: '#00ffff' },
        { name: '4B', rows: 3, students: [9, 9, 10], color: '#ffff00' },
        { name: '4C', rows: 3, students: [9, 9, 9], color: '#00ffff' },
        { name: '4D', rows: 3, students: [9, 9, 8], color: '#e9d5ff' },
        { name: '4E', rows: 3, students: [9, 9, 8], color: '#ffff00' },
      ];

      // Row 1-3
      for (let r = 0; r < 3; r++) {
        // 4A
        newItems.push({ 
          id: `4A-${r}`, type: 'table', x: 40 + r * 90, y: 60, width: 70, height: 40, 
          label: `4A\n${r === 0 ? '1-9' : r === 1 ? '10-18' : '19-28'} (${classes[0].students[r]})`, 
          color: classes[0].color 
        });
        // 4B
        newItems.push({ 
          id: `4B-${r}`, type: 'table', x: 45 + r * 90, y: 110, width: 70, height: 40, 
          label: `4B\n${r === 0 ? '1-9' : r === 1 ? '10-18' : '19-28'} (${classes[1].students[r]})`, 
          color: classes[1].color 
        });
        // 4C
        newItems.push({ 
          id: `4C-${r}`, type: 'table', x: 50 + r * 90, y: 160, width: 70, height: 40, 
          label: `4C\n${r === 0 ? '1-9' : r === 1 ? '10-18' : '19-27'} (${classes[2].students[r]})`, 
          color: classes[2].color 
        });
      }
      // 4D Column
      for (let r = 0; r < 3; r++) {
        newItems.push({ 
          id: `4D-${r}`, type: 'table', x: 310, y: 60 + r * 50, width: 70, height: 40, 
          label: `4D\n${r === 0 ? '1-9' : r === 1 ? '10-18' : '19-26'} (${classes[3].students[r]})`, 
          color: classes[3].color 
        });
      }
      // 4E Row
      for (let r = 0; r < 3; r++) {
        newItems.push({ 
          id: `4E-${r}`, type: 'table', x: 100 + r * 90, y: 210, width: 70, height: 40, 
          label: `4E\n${r === 0 ? '1-9' : r === 1 ? '10-18' : '19-26'} (${classes[4].students[r]})`, 
          color: classes[4].color 
        });
      }
    } else if (presetType === 'columns') {
      newItems.push({ id: 'p1', type: 'table', x: 80, y: 10, width: 200, height: 20, label: '投影機', color: '#ffffff' });
      newItems.push({ id: 'l1', type: 'table', x: 20, y: 30, width: 80, height: 15, label: '長枱', color: '#ffffff' });

      const leftCol = [
        { name: '5A', s: ['1-9', '10-17', '18-26'], c: '#00ffff' },
        { name: '5C', s: ['1-7', '8-14', '15-20'], c: '#00ff00' },
        { name: '5E', s: ['1-9', '10-17', '18-25'], c: '#00ffff' },
      ];
      const rightCol = [
        { name: '5B', s: ['1-7', '8-14', '15-21'], c: '#ffff00' },
        { name: '5D', s: ['1-9', '10-17', '18-26'], c: '#ff8c00' },
        { name: '5F', s: ['1-9', '10-17', '18-26'], c: '#ffff00' },
      ];

      for (let i = 0; i < 9; i++) {
        const groupIdx = Math.floor(i / 3);
        const subIdx = i % 3;
        // Left
        newItems.push({ 
          id: `L-${i}`, type: 'table', x: 100, y: 50 + i * 25, width: 60, height: 20, 
          label: `${leftCol[groupIdx].name}\n${leftCol[groupIdx].s[subIdx]}`, color: leftCol[groupIdx].c, fontSize: 8 
        });
        // Right
        newItems.push({ 
          id: `R-${i}`, type: 'table', x: 220, y: 50 + i * 25, width: 60, height: 20, 
          label: `${rightCol[groupIdx].name}\n${rightCol[groupIdx].s[subIdx]}`, color: rightCol[groupIdx].c, fontSize: 8 
        });
      }
    }
    setFloorPlanItems(newItems);
  };

  const removeFloorPlanItem = (id: string) => {
    setFloorPlanItems(floorPlanItems.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const updateItem = (id: string, updates: Partial<FloorPlanItem>) => {
    setFloorPlanItems(floorPlanItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Capture floor plan as image whenever items change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL();
        setFloorPlanImage(dataUrl);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [floorPlanItems]);

  const copyRichText = () => {
    if (!previewRef.current) return;
    
    const range = document.createRange();
    const selection = window.getSelection();
    
    if (selection) {
      selection.removeAllRanges();
      range.selectNodeContents(previewRef.current);
      selection.addRange(range);
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
      
      selection.removeAllRanges();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Layout size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">校園義工活動流程表產生器</h1>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Jockey Club Volunteer Together</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-1 bg-stone-100 p-1 rounded-lg self-end">
                {[
                  { id: 'A', label: '長者' },
                  { id: 'E', label: '環保' },
                  { id: 'B', label: '主題 B' },
                  { id: 'C', label: '主題 C' },
                  { id: 'D', label: '主題 D' }
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      selectedTheme === theme.id 
                        ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-stone-200' 
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 bg-stone-100 p-1 rounded-lg self-end">
                {[1, 2, 3].map(section => (
                  <button
                    key={section}
                    onClick={() => setSelectedSection(section)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      selectedSection === section 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    第 {section} 節
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Basic Info */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center gap-2">
                <Info size={18} className="text-emerald-600" />
                <h2 className="font-bold text-stone-800">活動基本資料</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">日期</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="date" name="date" value={formData.date} onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">地點</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="text" name="location" value={formData.location} onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">開始時間</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="time" name="startTime" value={formData.startTime} onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">結束時間</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="time" name="endTime" value={formData.endTime} onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">明愛主持同工</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text" name="staff" value={formData.staff} onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Class Counts */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-emerald-600" />
                  <h2 className="font-bold text-stone-800">人數自動加總區</h2>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  總計: {totalStudentsData.total} 人
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {Object.keys(classCounts).map(cls => (
                    <div key={cls} className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">{cls} 班</label>
                      <input 
                        type="number" 
                        value={classCounts[cls]} 
                        onChange={(e) => handleClassChange(cls, e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center text-sm font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Venue & Contacts */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center gap-2">
                <TableIcon size={18} className="text-emerald-600" />
                <h2 className="font-bold text-stone-800">場地設置與聯絡人</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">咪數量</label>
                    <div className="relative">
                      <Mic className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                      <input 
                        type="text" name="micCount" value={formData.micCount} onChange={handleInputChange}
                        className="w-full pl-7 pr-2 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">長枱</label>
                    <input 
                      type="text" name="tableCount" value={formData.tableCount} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 uppercase">椅子</label>
                    <input 
                      type="text" name="chairCount" value={formData.chairCount} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">負責同工聯絡</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text" name="staffContact" value={formData.staffContact} onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">學校聯絡人</label>
                  <input 
                    type="text" name="schoolContact" value={formData.schoolContact} onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">備註</label>
                  <textarea 
                    name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </section>

            {/* Floor Plan Designer */}
            <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Move size={18} className="text-emerald-600" />
                  <h2 className="font-bold text-stone-800">場地佈置規劃器</h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => addFloorPlanItem('table')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                    <Plus size={14} /> 加長枱
                  </button>
                  <button onClick={() => addFloorPlanItem('chair')} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">
                    <Plus size={14} /> 加椅子
                  </button>
                  <button onClick={() => addFloorPlanItem('projector')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                    <Plus size={14} /> 加投影機
                  </button>
                  <button onClick={() => addFloorPlanItem('mic')} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                    <Plus size={14} /> 加咪
                  </button>
                </div>

                <div className="flex gap-2 border-t border-stone-100 pt-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase self-center">快速範本:</span>
                  <button onClick={() => applyPreset('grid')} className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[10px] font-bold">網格佈局 (4A-E)</button>
                  <button onClick={() => applyPreset('columns')} className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[10px] font-bold">雙欄佈局 (5A-F)</button>
                </div>

                <div className="border border-stone-200 rounded-xl bg-stone-50 overflow-hidden relative" style={{ height: '300px' }}>
                  <Stage width={400} height={300} ref={stageRef} onClick={() => setSelectedItemId(null)}>
                    <Layer>
                      {/* Background Grid */}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <React.Fragment key={i}>
                          <Rect x={i * 40} y={0} width={1} height={300} fill="#e5e7eb" />
                          <Rect x={0} y={i * 40} width={400} height={1} fill="#e5e7eb" />
                        </React.Fragment>
                      ))}
                      
                      {floorPlanItems.map(item => (
                        <Group 
                          key={item.id} 
                          x={item.x} 
                          y={item.y} 
                          draggable 
                          onDragEnd={(e) => updateItem(item.id, { x: e.target.x(), y: e.target.y() })}
                          onClick={(e) => {
                            e.cancelBubble = true;
                            setSelectedItemId(item.id);
                          }}
                        >
                          {item.type === 'table' && (
                            <Rect 
                              width={item.width || 60} 
                              height={item.height || 30} 
                              fill={item.color} 
                              cornerRadius={2} 
                              stroke={selectedItemId === item.id ? "#10b981" : "#000"} 
                              strokeWidth={selectedItemId === item.id ? 2 : 0.5} 
                            />
                          )}
                          {item.type === 'chair' && (
                            <Rect 
                              width={item.width || 20} 
                              height={item.height || 20} 
                              fill={item.color} 
                              cornerRadius={2} 
                              stroke={selectedItemId === item.id ? "#10b981" : "#000"} 
                              strokeWidth={selectedItemId === item.id ? 2 : 0.5} 
                            />
                          )}
                          {item.type === 'projector' && (
                            <Rect 
                              width={item.width || 30} 
                              height={item.height || 30} 
                              fill={item.color} 
                              cornerRadius={2} 
                              stroke={selectedItemId === item.id ? "#10b981" : "#000"} 
                              strokeWidth={selectedItemId === item.id ? 2 : 0.5} 
                            />
                          )}
                          {item.type === 'mic' && (
                            <Circle 
                              radius={10} 
                              fill={item.color} 
                              stroke={selectedItemId === item.id ? "#10b981" : "#000"} 
                              strokeWidth={selectedItemId === item.id ? 2 : 0.5} 
                            />
                          )}
                          <KonvaText 
                            text={item.label} 
                            fontSize={item.fontSize || 10} 
                            fill="#000" 
                            y={item.type === 'mic' ? -5 : (item.height || 30) / 2 - (item.fontSize || 10) * (item.label.split('\n').length) / 2} 
                            width={item.width || 60} 
                            align="center" 
                            fontStyle="bold"
                          />
                        </Group>
                      ))}
                    </Layer>
                  </Stage>
                  
                  <div className="absolute bottom-2 right-2 text-[10px] text-stone-400 font-bold bg-white/80 px-2 py-1 rounded">
                    點擊物件編輯標籤
                  </div>
                </div>

                {selectedItemId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">編輯選中物件</span>
                      <button onClick={() => removeFloorPlanItem(selectedItemId)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={floorPlanItems.find(i => i.id === selectedItemId)?.label || ''}
                        onChange={(e) => updateItem(selectedItemId, { label: e.target.value })}
                        placeholder="輸入標籤，按 Enter 換行"
                        className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        rows={2}
                      />
                      <input 
                        type="color" 
                        value={floorPlanItems.find(i => i.id === selectedItemId)?.color || '#ffffff'}
                        onChange={(e) => updateItem(selectedItemId, { color: e.target.value })}
                        className="w-8 h-8 rounded border border-emerald-200 cursor-pointer"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-500 flex items-center gap-2">
                  <ChevronRight size={18} /> 即時預覽 (A4 佈局)
                </h3>
                <button 
                  onClick={copyRichText}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-lg active:scale-95 ${
                    copied ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Clipboard size={18} />}
                  {copied ? '已複製到剪貼簿' : '一鍵複製 (富文本)'}
                </button>
              </div>

              {/* A4 Simulation Container */}
              <div className="bg-white shadow-2xl rounded-sm border border-stone-300 overflow-y-auto h-[800px] p-[1cm] relative">
                <div ref={previewRef} className="preview-content">
                  {/* Inline styles for Google Docs compatibility */}
                  <div style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', fontSize: '12pt', color: '#000', lineHeight: 1.2 }}>
                    
                    {/* Header Section */}
                    <div style={{ margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', marginBottom: '10px' }}>
                      賽馬會眾心行善 – 義工推廣校園夥伴計劃（香港明愛）
                    </div>
                    <div style={{ margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '14pt', marginBottom: '20px' }}>
                      {currentCourse.title}
                    </div>
                    <div style={{ margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '12pt', marginBottom: '20px' }}>
                      活動流程及場地佈置
                    </div>

                    {/* 1. Activity Data */}
                    <div style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}>1. 活動資料</div>
                    <div style={{ margin: 0, paddingLeft: '20px', marginBottom: '15px' }}>
                      <div style={{ margin: 0 }}>1. 日期: {formData.date}</div>
                      <div style={{ margin: 0 }}>2. 時間: {formData.startTime} - {formData.endTime}</div>
                      <div style={{ margin: 0 }}>3. 地點：{formData.location}</div>
                      <div style={{ margin: 0 }}>4. 學生人數：{totalStudentsData.total} 名學生 ({totalStudentsData.details})</div>
                      <div style={{ margin: 0 }}>5. 明愛協助同工及義工：</div>
                      <div style={{ margin: 0, paddingLeft: '20px' }}>• 主持：{formData.staff}</div>
                      <div style={{ margin: 0 }}>6. 場地設置：（有勞校方準備）</div>
                      <div style={{ margin: 0, paddingLeft: '20px' }}>• 咪 {formData.micCount} 支</div>
                      <div style={{ margin: 0, paddingLeft: '20px' }}>• 長枱 {formData.tableCount} 張</div>
                      <div style={{ margin: 0, paddingLeft: '20px' }}>• 椅子 {formData.chairCount} 張</div>
                      <div style={{ margin: 0 }}>7. 活動負責同工：</div>
                      <div style={{ margin: 0, paddingLeft: '20px' }}>• 賽馬會眾心行善計劃 {formData.staffContact}</div>
                      <div style={{ margin: 0, paddingLeft: '20px' }}>• {formData.schoolContact}</div>
                      <div style={{ margin: 0 }}>8. 備注：{formData.remarks}</div>
                    </div>

                    {/* 2. Rundown Table */}
                    <div style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}>2. 活動流程</div>
                    <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                          <th style={{ border: '1px solid black', padding: '5px', width: '20%' }}>時間</th>
                          <th style={{ border: '1px solid black', padding: '5px', width: '50%' }}>內容</th>
                          <th style={{ border: '1px solid black', padding: '5px', width: '30%' }}>物資/備註</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCourse.rundown.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center', verticalAlign: 'top' }}>
                              {calculateTime(formData.startTime, item.mins)} - {calculateTime(formData.startTime, item.mins + item.duration)}
                              <br />
                              <span style={{ fontSize: '10pt', color: '#666' }}>({item.duration}分鐘)</span>
                            </td>
                            <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top' }}>
                              {item.content.split('\n').map((line, i) => (
                                <div key={i} style={{ margin: 0 }}>{line}</div>
                              ))}
                            </td>
                            <td style={{ border: '1px solid black', padding: '5px', verticalAlign: 'top' }}>
                              {item.remarks.split('\n').map((line, i) => (
                                <div key={i} style={{ margin: 0 }}>{line}</div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* 3. Discussion/Guideline Section */}
                    {currentCourse.discussion && (
                      <>
                        <div style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}>
                          3. {currentCourse.discussionTitle}
                        </div>
                        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                              {currentCourse.discussionHeaders?.map((header, idx) => (
                                <th key={idx} style={{ border: '1px solid black', padding: '5px' }}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentCourse.discussion.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold', textAlign: 'center' }}>{item.col1}</td>
                                <td style={{ border: '1px solid black', padding: '5px' }}>{item.col2}</td>
                                <td style={{ border: '1px solid black', padding: '5px' }}>{item.col3}</td>
                                <td style={{ border: '1px solid black', padding: '5px' }}>{item.col4}</td>
                                {item.col5 && <td style={{ border: '1px solid black', padding: '5px' }}>{item.col5}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}

                    {/* 4. Floor Plan Section */}
                    <div style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}>4. 場地設置圖</div>
                    <div style={{ margin: 0, border: '1px solid #ccc', padding: '10px', textAlign: 'center', backgroundColor: '#fafafa', marginBottom: '20px' }}>
                      {floorPlanImage ? (
                        <img 
                          src={floorPlanImage} 
                          alt="Floor Plan" 
                          style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div style={{ padding: '40px', color: '#999', fontStyle: 'italic' }}>場地設置圖規劃中...</div>
                      )}
                    </div>

                    <div style={{ margin: 0, textAlign: 'center', marginTop: '20px', fontSize: '10pt', color: '#999' }}>
                      --- 完 ---
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-stone-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-stone-400 text-sm">
          <p>© 2026 香港明愛 - 賽馬會眾心行善計劃</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-600 transition-colors">使用指南</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">隱私政策</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">聯絡我們</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

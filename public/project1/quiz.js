/**
 * 石川県の魚クイズ（石川県公式情報ベース）
 * 参照元:
 *   https://www.pref.ishikawa.lg.jp/suisanka/siki/siki.html
 *
 * 問題形式（各スポットで3問を出題）:
 *   question: 問題文
 *   correct: 正解
 *   distractors: 不正解の候補（ここからランダムに選択）
 *   choiceCount: 表示する選択肢の数（3・4・5）
 *   difficulty: 'easy' | 'normal' | 'hard'（表示には未使用）
 *   explanation: 正解の解説
 */

const allQuestions = [
  // easy
  {
    question: '「石川の四季のさかな」で春のさかなとして紹介されているのは？',
    correct: 'さより',
    distractors: ['ぶり', 'あまえび', 'するめいか', 'ずわいがに'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '石川県公式「石川の四季のさかな」では、春のさかなとして「さより」が紹介されています。'
  },
  {
    question: '秋のさかなで、石川県のお刺身の代表として紹介されているのは？',
    correct: 'あまえび',
    distractors: ['かれい', 'するめいか', 'ぶり', 'さより'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '同ページの秋のさかなの項目で、アマエビは「石川県でおいしいお刺身の代表的な一品」と説明されています。'
  },
  {
    question: '冬に定置網で漁獲される脂ののった大型魚として紹介されるのは？',
    correct: 'ぶり',
    distractors: ['さわら', 'まだら', 'いわがき', 'かれい'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '冬のさかなの項目で、石川県のブリは冬に定置網で漁獲される脂ののった大型魚とされています。'
  },
  {
    question: '夏の風物詩として紹介されているものは？',
    correct: 'イカ釣り船の漁火',
    distractors: ['ぶり網', 'かき小屋', '寒ぶり宣言', '甘えび漁の初競り'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '夏のさかな「いか」の説明で、水平線に並ぶイカ釣り船の漁火が夏の風物詩と紹介されています。'
  },
  {
    question: '石川県の冬の味覚の代表として紹介されているカニは？',
    correct: 'ズワイガニ',
    distractors: ['毛ガニ', 'タラバガニ', 'ワタリガニ', 'ガザミ'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '冬のさかなの項目では、石川県の冬の味覚の代表としてズワイガニ（加能ガニ）が紹介されています。'
  },
  {
    question: '「石川の四季のさかな」を決定した主な目的として正しいものは？',
    correct: '地元で獲れる新鮮な魚介類の再評価と消費拡大',
    distractors: ['海外輸出の規制強化', '観光税の導入', '養殖業への一本化', '漁港の民営化'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: 'ページ冒頭で、旬の再認識、地元魚介類の再評価、消費拡大を目的に「石川の四季のさかな」を決定したと説明されています。'
  },

  // normal
  {
    question: '石川県の漁業生産額のうち、イカ類が占める割合は約どれくらい？',
    correct: '約3割',
    distractors: ['約1割', '約5割', '約7割', '約9割'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '夏の「いか」の説明で、石川県の漁業生産額のうちイカ類は3割と記載されています。'
  },
  {
    question: '石川県で漁獲されるイカ類のうち、スルメイカが占める割合は約どれくらい？',
    correct: '約8割',
    distractors: ['約2割', '約4割', '約6割', '約10割'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '同じく「いか」の項目で、イカ類のうち8割がスルメイカとされています。'
  },
  {
    question: 'アマエビの標準和名は？',
    correct: 'ホッコクアカエビ',
    distractors: ['ホンアカエビ', 'ニホンアカエビ', 'アカシマエビ', 'ベニエビ'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '秋の「あまえび」の説明に、標準和名はホッコクアカエビと明記されています。'
  },
  {
    question: 'ずわいがに・こうばこがにの主な生息水深として正しいのは？',
    correct: '250〜400メートル',
    distractors: ['10〜30メートル', '50〜100メートル', '100〜180メートル', '500〜800メートル'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '冬の「ずわいがに・こうばこがに」の説明で、水深250〜400メートルに生息するとされています。'
  },
  {
    question: '石川県でのズワイガニ漁の解禁日は？',
    correct: '11月6日',
    distractors: ['9月1日', '10月15日', '12月1日', '1月1日'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '同ページに、ズワイガニは11月6日が解禁日と記載されています。'
  },
  {
    question: '石川県ではズワイガニの雌を何と呼ぶ？',
    correct: 'コウバコガニ',
    distractors: ['セコガニ', 'メスワイガニ', 'アカガニ', 'ハナガニ'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '冬の項目で、石川県では雄をズワイガニ、雌をコウバコガニと呼び分けると説明されています。'
  },

  // hard
  {
    question: '能登ではサヨリのことを何と呼ぶ？',
    correct: 'スズ',
    distractors: ['ハチメ', 'アワテ', 'クチボソ', 'ネジタ'],
    choiceCount: 5,
    difficulty: 'hard',
    explanation: '春の「さより」の説明で、能登ではサヨリを「スズ」と呼ぶと記載されています。'
  },
  {
    question: '2隻の船で網を引き回してサヨリを漁獲する漁法名は？',
    correct: 'スズヒキ',
    distractors: ['ブリヒキ', 'アミマワシ', 'モゾコアミ', 'サヨリマキ'],
    choiceCount: 5,
    difficulty: 'hard',
    explanation: '同じく春の項目で、2隻の船で網を引き回すサヨリ漁法を「スズヒキ」と呼ぶと説明されています。'
  },
  {
    question: 'アマエビが主に生息すると紹介されている水深は？',
    correct: '500メートル',
    distractors: ['50メートル', '100メートル', '250メートル', '1000メートル'],
    choiceCount: 5,
    difficulty: 'hard',
    explanation: '秋の「あまえび」の説明では、水深500メートルの深海に住むとされています。'
  },
  {
    question: 'アマエビが住む海の水温として紹介されているのは？',
    correct: '0度台',
    distractors: ['5度台', '10度台', '15度台', '20度台'],
    choiceCount: 5,
    difficulty: 'hard',
    explanation: '同ページでは、アマエビは水温0度台の冷たい深海に住むと説明されています。'
  },
  {
    question: 'アマエビが雄から雌に性転換するとされる年齢は？',
    correct: '4〜6才',
    distractors: ['1〜2才', '2〜3才', '7〜8才', '9〜10才'],
    choiceCount: 5,
    difficulty: 'hard',
    explanation: '秋の項目で、アマエビは成長過程で性転換し、4〜6才で雄から雌になると紹介されています。'
  },
  {
    question: '能登のぶり網による漁が、すでに行われていたとされる時代は？',
    correct: '16世紀',
    distractors: ['12世紀', '14世紀', '18世紀', '20世紀'],
    choiceCount: 5,
    difficulty: 'hard',
    explanation: '冬の「ぶり」の説明に、16世紀には既にぶり網による漁が行われていたようだと記載されています。'
  }
];

const additionalQuestions = [
  {
    question: '石川県で漁獲されるイカ類の中心を占める種類は？',
    correct: 'するめいか',
    distractors: ['やりいか', 'けんさきいか', 'もんごういか', 'こういか'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '石川県では、漁獲されるイカ類のうちスルメイカが大きな割合を占めると紹介されています。'
  },
  {
    question: '夏の「いか」の説明で、夜の海に並ぶ光景として紹介されるのは？',
    correct: 'イカ釣り船の漁火',
    distractors: ['定置網の灯り', '港の常夜灯', '花火大会', '橋のライトアップ'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '夏の風物詩として、水平線に並ぶイカ釣り船の漁火が紹介されています。'
  },
  {
    question: '秋のさかなとして紹介される甲殻類は？',
    correct: 'あまえび',
    distractors: ['しゃこ', 'けがに', 'わたりがに', 'いせえび'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '「石川の四季のさかな」では秋のさかなとしてアマエビが紹介されています。'
  },
  {
    question: 'あまえび（アマエビ）の標準和名として正しいのは？',
    correct: 'ホッコクアカエビ',
    distractors: ['ホンアカエビ', 'アカシマエビ', 'ニホンアカエビ', 'ミナミアカエビ'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: 'アマエビの標準和名はホッコクアカエビです。'
  },
  {
    question: 'アマエビが主に生息すると紹介される深さは？',
    correct: '500メートル付近',
    distractors: ['50メートル付近', '120メートル付近', '250メートル付近', '900メートル付近'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: 'アマエビは水深500メートル付近の深海に住むと紹介されています。'
  },
  {
    question: 'アマエビが生息する海の水温として紹介されるのは？',
    correct: '0度台',
    distractors: ['5度台', '10度台', '15度台', '20度台'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: 'アマエビは水温0度台の冷たい深海に生息すると説明されています。'
  },
  {
    question: 'アマエビが雄から雌に性転換するとされる年齢帯は？',
    correct: '4〜6才',
    distractors: ['1〜2才', '2〜3才', '7〜8才', '9〜10才'],
    choiceCount: 4,
    difficulty: 'hard',
    explanation: '成長の過程で、アマエビは4〜6才ごろに雄から雌へ性転換すると紹介されています。'
  },
  {
    question: '冬に定置網で漁獲される脂ののった大型魚として紹介されるのは？',
    correct: 'ぶり',
    distractors: ['さわら', 'かれい', 'まだい', 'たら'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '石川県の冬の魚として、脂ののったブリが紹介されています。'
  },
  {
    question: '石川県で冬のぶりが主に漁獲される漁法は？',
    correct: '定置網',
    distractors: ['一本釣り', '底びき網', '刺し網', '延縄'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '冬のぶりは主に定置網で漁獲されると説明されています。'
  },
  {
    question: '能登のぶり網漁がすでに行われていたとされる時代は？',
    correct: '16世紀',
    distractors: ['12世紀', '14世紀', '18世紀', '20世紀'],
    choiceCount: 4,
    difficulty: 'hard',
    explanation: '能登では16世紀にはぶり網漁が行われていたと紹介されています。'
  },
  {
    question: '石川県の冬の味覚として代表的に紹介されるカニは？',
    correct: 'ズワイガニ',
    distractors: ['タラバガニ', 'ワタリガニ', '毛ガニ', 'ガザミ'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '石川県の冬の味覚の代表としてズワイガニが紹介されています。'
  },
  {
    question: '石川県におけるズワイガニ漁の解禁日は？',
    correct: '11月6日',
    distractors: ['10月1日', '11月1日', '12月1日', '1月6日'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '石川県ではズワイガニ漁は11月6日に解禁されます。'
  },
  {
    question: '石川県でズワイガニの雌を指す呼び名は？',
    correct: 'コウバコガニ',
    distractors: ['セコガニ', 'メスガニ', 'アカガニ', 'ベニガニ'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '石川県ではズワイガニの雌をコウバコガニと呼びます。'
  },
  {
    question: 'ズワイガニ・コウバコガニの主な生息水深は？',
    correct: '250〜400メートル',
    distractors: ['20〜50メートル', '80〜120メートル', '150〜200メートル', '500〜700メートル'],
    choiceCount: 4,
    difficulty: 'hard',
    explanation: 'ズワイガニとコウバコガニは、水深250〜400メートルに生息するとされています。'
  },
  {
    question: '「石川の四季のさかな」で春のさかなとして紹介されるのは？',
    correct: 'さより',
    distractors: ['ぶり', 'あまえび', 'ずわいがに', 'するめいか'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '春のさかなとして紹介されているのは、さよりです。'
  },
  {
    question: '能登ではサヨリのことを何と呼ぶ？',
    correct: 'スズ',
    distractors: ['ハチメ', 'ガンド', 'アワテ', 'サンパチ'],
    choiceCount: 4,
    difficulty: 'hard',
    explanation: '能登ではサヨリを「スズ」と呼ぶと紹介されています。'
  },
  {
    question: '2隻の船で網を引き回してサヨリを漁獲する漁法は？',
    correct: 'スズヒキ',
    distractors: ['サヨリ網', 'ぶり曳き', 'いか曳き', '二艘引き'],
    choiceCount: 4,
    difficulty: 'hard',
    explanation: '能登で行われるサヨリ漁法としてスズヒキが紹介されています。'
  },
  {
    question: '石川県の漁業生産額でイカ類が占める割合は約どれくらい？',
    correct: '約3割',
    distractors: ['約1割', '約5割', '約7割', '約9割'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '石川県の漁業生産額に占めるイカ類の割合は約3割と紹介されています。'
  },
  {
    question: '石川県で漁獲されるイカ類のうち、スルメイカの割合は約どれくらい？',
    correct: '約8割',
    distractors: ['約2割', '約4割', '約6割', '約10割'],
    choiceCount: 4,
    difficulty: 'normal',
    explanation: '石川県で漁獲されるイカ類のうち、スルメイカは約8割を占めます。'
  },
  {
    question: '「石川の四季のさかな」を決定した主な目的として正しいものは？',
    correct: '地元で獲れる新鮮な魚介類の再評価と消費拡大',
    distractors: ['観光税の新設', '輸出規制の強化', '漁港の民営化', '養殖のみへの転換'],
    choiceCount: 4,
    difficulty: 'easy',
    explanation: '旬の再認識や地元魚介類の再評価、消費拡大を目的として決定されています。'
  }
];

const KANAZAWA_TOURIST_SPOTS = [
  '金沢駅',
  '兼六園',
  '近江町市場',
  'ひがし茶屋街',
  '武家屋敷',
  '金沢21世紀美術館',
  '金沢中央卸売市場',
  '西茶屋街',
  '金沢城',
  '卯辰山',
  'ヤマト・麴バーク',
  '妙立寺(忍者寺)'
];
const QUIZ_QUESTION_COUNT = 3;
const STORAGE_KEY = 'selectedKanazawaSpot';
const THEME_STORAGE_KEY = 'selectedColorTheme';

function getStoredSpot() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    return null;
  }
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (_) {
    return null;
  }
}

// 状態管理
let currentIndex = 0;
let score = 0;
let selectedAnswers = [];
let answeredQuestions = []; // 解答済み（フィードバック表示済み）か
let quizStarted = false;
let questions = []; // スポット別に抽出した問題リスト
const storedSpot = getStoredSpot();
const selectedArea = KANAZAWA_TOURIST_SPOTS.includes(storedSpot)
  ? storedSpot
  : KANAZAWA_TOURIST_SPOTS[0];
const popupMode = (() => {
  try {
    return new URLSearchParams(window.location.search).get('popup') === '1';
  } catch (_) {
    return false;
  }
})();

// DOM 要素
const elements = {
  quizIntro: document.getElementById('quizIntro'),
  quizContent: document.getElementById('quizContent'),
  quizResult: document.getElementById('quizResult'),
  startBtn: document.getElementById('startBtn'),
  quizAreaText: document.getElementById('quizAreaText'),
  spotQuizGuide: document.getElementById('spotQuizGuide'),
  questionText: document.getElementById('questionText'),
  optionsList: document.getElementById('optionsList'),
  spotBadge: document.getElementById('spotBadge'),
  feedbackMessage: document.getElementById('feedbackMessage'),
  feedbackIcon: document.getElementById('feedbackIcon'),
  feedbackText: document.getElementById('feedbackText'),
  feedbackExplanation: document.getElementById('feedbackExplanation'),
  prevBtn: document.getElementById('prevBtn'),
  confirmBtn: document.getElementById('confirmBtn'),
  nextBtn: document.getElementById('nextBtn'),
  submitBtn: document.getElementById('submitBtn'),
  retryBtn: document.getElementById('retryBtn'),
  progressFill: document.getElementById('progressFill'),
  questionCounter: document.getElementById('questionCounter'),
  scoreDisplay: document.getElementById('scoreDisplay'),
  resultMessage: document.getElementById('resultMessage')
};

// 配列をシャッフル（Fisher-Yates）
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 問題の選択肢をランダムに生成（正解 + 不正解をランダムに選択）
function buildQuestionOptions(question) {
  const { correct, distractors, choiceCount } = question;
  const availableDistractors = distractors.filter(d => d !== correct);
  const shuffledDistractors = shuffleArray(availableDistractors);
  const neededWrong = Math.min(choiceCount - 1, availableDistractors.length);
  const selectedWrong = shuffledDistractors.slice(0, neededWrong);
  const options = [...selectedWrong, correct];
  const shuffledOptions = shuffleArray(options);
  const correctIndex = shuffledOptions.indexOf(correct);
  return {
    ...question,
    options: shuffledOptions,
    correctIndex
  };
}

function buildQuestionsBySpot(questionPool) {
  const spotBuckets = Object.fromEntries(
    KANAZAWA_TOURIST_SPOTS.map(spot => [spot, []])
  );

  questionPool.forEach((question, index) => {
    const mappedSpot = KANAZAWA_TOURIST_SPOTS[index % KANAZAWA_TOURIST_SPOTS.length];
    spotBuckets[mappedSpot].push(question);
  });

  return spotBuckets;
}

const allQuestionPool = [...allQuestions, ...additionalQuestions];
const questionsBySpot = buildQuestionsBySpot(allQuestionPool);

function requestClosePopup() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage('close-quiz-popup', '*');
    return;
  }
  window.location.href = 'index.html';
}

function setupPopupMode() {
  if (!popupMode) return;

  document.body.classList.add('quiz-popup-mode');
  document.querySelectorAll('a.btn-link[href="index.html"]').forEach(link => {
    link.textContent = '閉じる';
    link.addEventListener('click', event => {
      event.preventDefault();
      requestClosePopup();
    });
  });
}

function setupThemeMode() {
  const storedTheme = getStoredTheme();
  if (storedTheme === 'light' || storedTheme === 'dark') {
    document.body.dataset.theme = storedTheme;
  }
}

// 選択したスポット向けに3問を抽出
function getSpotQuestions() {
  const spotQuestions = questionsBySpot[selectedArea] || [];
  const pickedQuestions = shuffleArray(spotQuestions).slice(0, QUIZ_QUESTION_COUNT);

  if (pickedQuestions.length < QUIZ_QUESTION_COUNT) {
    const fallback = shuffleArray(allQuestionPool)
      .filter(question => !pickedQuestions.includes(question))
      .slice(0, QUIZ_QUESTION_COUNT - pickedQuestions.length);
    pickedQuestions.push(...fallback);
  }

  return pickedQuestions.map(question => buildQuestionOptions(question));
}

// 地図ページで選んだスポットを表示
function setupAreaChip() {
  if (!elements.quizAreaText) return;
  elements.quizAreaText.textContent = `選択エリア: ${selectedArea}`;
  if (elements.spotQuizGuide) {
    elements.spotQuizGuide.textContent = `${selectedArea}エリアのクイズを${QUIZ_QUESTION_COUNT}問出題します。`;
  }
}

// スタート
function startQuiz() {
  questions = getSpotQuestions();
  if (questions.length === 0) {
    alert('このエリアの問題を準備できませんでした。別のエリアでお試しください。');
    return;
  }

  quizStarted = true;
  selectedAnswers = new Array(questions.length).fill(null);
  answeredQuestions = new Array(questions.length).fill(false);
  currentIndex = 0;
  score = 0;

  elements.quizIntro.classList.add('hidden');
  elements.quizContent.classList.remove('hidden');
  renderQuestion();
}

// 問題を描画
function renderQuestion() {
  const question = questions[currentIndex];
  if (elements.spotBadge) {
    elements.spotBadge.textContent = `${selectedArea}エリア`;
    elements.spotBadge.className = 'difficulty-badge difficulty-normal';
  }
  elements.questionText.textContent = question.question;

  // 選択肢
  elements.optionsList.innerHTML = '';
  question.options.forEach((option, index) => {
    const li = document.createElement('li');
    li.className = 'option-item';
    li.textContent = option;
    li.dataset.index = index;
    li.addEventListener('click', () => selectOption(index));
    elements.optionsList.appendChild(li);
  });

  // フィードバックを隠す
  elements.feedbackMessage.classList.add('hidden');
  elements.feedbackExplanation.textContent = '';

  // 前回選択した答えを復元、解答済みならフィードバック表示
  if (answeredQuestions[currentIndex]) {
    showFeedbackForCurrentQuestion();
  } else if (selectedAnswers[currentIndex] !== null) {
    const items = elements.optionsList.querySelectorAll('.option-item');
    items[selectedAnswers[currentIndex]].classList.add('selected');
  }

  // ナビゲーション
  elements.prevBtn.disabled = currentIndex === 0;
  elements.confirmBtn.disabled = answeredQuestions[currentIndex] || selectedAnswers[currentIndex] === null;

  const isLastQuestion = currentIndex === questions.length - 1;
  elements.nextBtn.style.display = isLastQuestion ? 'none' : '';
  elements.nextBtn.disabled = !answeredQuestions[currentIndex];
  elements.submitBtn.style.display = isLastQuestion ? '' : 'none';
  elements.submitBtn.disabled = !answeredQuestions[currentIndex];

  updateProgress();
}

// 選択肢を選択
function selectOption(index) {
  if (answeredQuestions[currentIndex]) return; // 解答済みなら無視

  const items = elements.optionsList.querySelectorAll('.option-item');
  items.forEach(item => item.classList.remove('selected'));
  items[index].classList.add('selected');
  selectedAnswers[currentIndex] = index;

  // 決定ボタンを有効化（選択があれば有効）
  updateConfirmButton();
}

// 決定ボタンを押したとき
function confirmAnswer() {
  if (answeredQuestions[currentIndex]) return;
  if (selectedAnswers[currentIndex] === null) return;

  answeredQuestions[currentIndex] = true;

  // 正解/不正解のフィードバックを表示
  showFeedbackForCurrentQuestion();

  // 決定ボタンを無効化、次へ/結果を見るを有効化
  elements.confirmBtn.disabled = true;
  elements.nextBtn.disabled = false;
  if (currentIndex === questions.length - 1) {
    elements.submitBtn.disabled = false;
  }
}

// 現在の問題のフィードバックを表示
function showFeedbackForCurrentQuestion() {
  const question = questions[currentIndex];
  const selectedIndex = selectedAnswers[currentIndex];
  const isCorrect = selectedIndex === question.correctIndex;

  const items = elements.optionsList.querySelectorAll('.option-item');
  items.forEach((item, i) => {
    item.classList.add('disabled');
    if (i === question.correctIndex) {
      item.classList.add('correct');
    }
    if (selectedIndex !== null && i === selectedIndex && !isCorrect) {
      item.classList.add('incorrect');
    }
  });

  // メッセージ表示
  elements.feedbackMessage.classList.remove('hidden');
  elements.feedbackIcon.textContent = isCorrect ? '〇' : '×';
  elements.feedbackText.textContent = isCorrect
    ? '正解！'
    : `不正解（正解: ${question.correct}）`;
  elements.feedbackExplanation.textContent = question.explanation;
  elements.feedbackMessage.className = `feedback-message feedback-${isCorrect ? 'correct' : 'incorrect'}`;
}

// 選択変更時に決定ボタンの有効/無効を更新
function updateConfirmButton() {
  if (!quizStarted || !elements.confirmBtn) return;
  elements.confirmBtn.disabled = answeredQuestions[currentIndex] || selectedAnswers[currentIndex] === null;
}

// 次へ
function nextQuestion() {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

// 前へ
function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

// 結果を表示
function showResult() {
  score = selectedAnswers.reduce((acc, answer, i) => {
    return acc + (answer === questions[i].correctIndex ? 1 : 0);
  }, 0);

  elements.quizContent.classList.add('hidden');
  elements.quizResult.classList.remove('hidden');

  elements.scoreDisplay.textContent = `${score} / ${questions.length} 問正解`;
  const percentage = Math.round((score / questions.length) * 100);
  elements.resultMessage.textContent = getResultMessage(percentage);
}

function getResultMessage(percentage) {
  if (percentage === 100) return `${selectedArea}エリアを完全制覇！次は別のエリアにも挑戦してみましょう。`;
  if (percentage >= 80) return '素晴らしい正答率です！もう1回挑戦して満点を目指しましょう。';
  if (percentage >= 60) return '良い出来です！解説を読んで次はさらに得点アップを狙えます。';
  return 'もう一度挑戦してみましょう！別のエリアに変えると問題が変わります。';
}

// もう一度
function retryQuiz() {
  quizStarted = false;
  elements.quizContent.classList.add('hidden');
  elements.quizResult.classList.add('hidden');
  elements.quizIntro.classList.remove('hidden');
  elements.progressFill.style.width = '0%';
  elements.questionCounter.textContent = '';
}

// 進捗バー更新
function updateProgress() {
  const progress = ((currentIndex + 1) / questions.length) * 100;
  elements.progressFill.style.width = `${progress}%`;
  elements.questionCounter.textContent = `問題 ${currentIndex + 1} / ${questions.length}`;
}

// 初期化
setupThemeMode();
setupAreaChip();
setupPopupMode();

// イベントリスナー
elements.startBtn.addEventListener('click', startQuiz);
elements.confirmBtn.addEventListener('click', confirmAnswer);
elements.nextBtn.addEventListener('click', nextQuestion);
elements.prevBtn.addEventListener('click', prevQuestion);
elements.submitBtn.addEventListener('click', showResult);
elements.retryBtn.addEventListener('click', retryQuiz);

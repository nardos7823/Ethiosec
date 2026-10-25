// ============================================
// EthioSec — Complete JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  console.log('%cEthioSec loaded ✅', 'color:#00d9a3;font-weight:bold;');

  // ============================================
  // 1. MOBILE MENU TOGGLE
  // ============================================
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ============================================
  // 2. SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // 3. PASSWORD STRENGTH CHECKER
  // ============================================
  const passwordInput = document.getElementById('passwordInput');
  const strengthFill = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');
  const checklistItems = document.querySelectorAll('#checklist li');

  if (passwordInput && strengthFill && strengthLabel) {
    passwordInput.addEventListener('input', () => {
      const value = passwordInput.value;

      const checks = {
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        symbol: /[^A-Za-z0-9]/.test(value),
      };

      checklistItems.forEach(item => {
        item.classList.toggle('pass', checks[item.dataset.check]);
      });

      const score = Object.values(checks).filter(Boolean).length;

      if (value.length === 0) {
        strengthFill.style.width = '0%';
        strengthFill.style.background = 'var(--danger)';
        strengthLabel.textContent = 'Enter a password to begin';
        strengthLabel.style.color = 'var(--muted)';
        return;
      }

      const levels = [
        { width: '20%',  color: '#ef4444', label: 'Very Weak' },
        { width: '40%',  color: '#f97316', label: 'Weak' },
        { width: '60%',  color: '#fbbf24', label: 'Medium' },
        { width: '80%',  color: '#84cc16', label: 'Strong' },
        { width: '100%', color: '#00d9a3', label: 'Very Strong' },
      ];

      const level = levels[Math.min(score, 4)];
      strengthFill.style.width = level.width;
      strengthFill.style.background = level.color;
      strengthLabel.textContent = `Strength: ${level.label}`;
      strengthLabel.style.color = level.color;
    });
  }

  // ============================================
  // 4. PHISHING AWARENESS QUIZ
  // ============================================
  const phishingQuestions = [
    {
      from: "security@paypa1.com",
      subject: "URGENT: Your account will be suspended in 24 hours",
      body: "Dear Customer,\n\nWe detected unusual activity on your account. To avoid permanent suspension, you must verify your identity immediately.\n\nClick here to verify: http://paypa1-secure-login.xyz/verify\n\nFailure to act within 24 hours will result in account closure.\n\nPayPal Security Team",
      answer: "phishing",
      explanation: "Classic phishing. The sender domain 'paypa1.com' uses the number '1' instead of the letter 'l' — a trick called typosquatting.",
      flags: [
        "Fake domain: 'paypa1.com' (uses '1' instead of 'l')",
        "Urgency: '24 hours' — pressure to act fast",
        "Suspicious link: 'paypa1-secure-login.xyz' — not the real PayPal domain",
        "Generic greeting: 'Dear Customer'",
        "Threat: 'permanent suspension' to scare you"
      ]
    },
    {
      from: "noreply@github.com",
      subject: "Your GitHub password was changed",
      body: "Hi Nardos,\n\nThe password for your GitHub account was successfully changed on Oct 23, 2026 at 14:32 UTC.\n\nIf you did not make this change, please secure your account immediately by visiting:\nhttps://github.com/settings/security\n\nThanks,\nThe GitHub Team",
      answer: "legit",
      explanation: "Legitimate. The sender is the real 'github.com' domain, the link goes to the real GitHub site, and it uses your name.",
      flags: [
        "Real domain: '@github.com'",
        "Link goes to real site: 'github.com/settings/security'",
        "Personalized: uses your name",
        "No urgency or threats",
        "You can verify by logging into GitHub directly"
      ]
    },
    {
      from: "it-support@company-helpdesk.net",
      subject: "Action Required: Reset your password now",
      body: "Dear Employee,\n\nOur IT department is migrating to a new system. All employees must reset their passwords by clicking the link below within 2 hours, or lose access to company email.\n\nReset password: http://company-helpdesk.net/reset?user=you\n\nIT Support",
      answer: "phishing",
      explanation: "Phishing. Real IT departments don't send password reset links via email with a 2-hour deadline. The domain 'company-helpdesk.net' is not your company's real domain.",
      flags: [
        "External domain: 'company-helpdesk.net' — not your company",
        "Extreme urgency: 'within 2 hours'",
        "Threat: 'lose access to company email'",
        "Password resets should never come via email links",
        "Generic greeting: 'Dear Employee'"
      ]
    },
    {
      from: "notifications@linkedin.com",
      subject: "You have 3 new connection requests",
      body: "Hi Nardos,\n\nYou have 3 new connection requests waiting for you on LinkedIn.\n\nView them here: https://www.linkedin.com/mynetwork/invitation-manager/\n\nThe LinkedIn Team",
      answer: "legit",
      explanation: "Legitimate. The sender is the real LinkedIn domain, the link goes to linkedin.com, and it's a routine notification with no pressure.",
      flags: [
        "Real domain: '@linkedin.com'",
        "Link goes to real site: 'linkedin.com'",
        "Routine notification — no urgency",
        "No request for credentials or payment"
      ]
    },
    {
      from: "billing@netflix.com",
      subject: "Your payment failed — update your card",
      body: "Hi Nardos,\n\nWe were unable to process your last payment of $15.99. To keep watching, please update your payment information within 48 hours.\n\nUpdate payment: http://netflix-billing-update.info/card\n\nNetflix Billing",
      answer: "phishing",
      explanation: "Phishing. The sender looks like 'netflix.com' but the link goes to 'netflix-billing-update.info' — a fake domain. Real Netflix would send you to netflix.com.",
      flags: [
        "Link domain is fake: 'netflix-billing-update.info'",
        "Asks for payment card info via email link",
        "Urgency: 'within 48 hours'",
        "Real companies never ask for card details via email links",
        "Always go to netflix.com directly to check billing"
      ]
    }
  ];

  let currentQuestion = 0;
  let currentScore = 0;
  let answered = false;

  const emailFrom = document.getElementById('emailFrom');
  const emailSubject = document.getElementById('emailSubject');
  const emailBody = document.getElementById('emailBody');
  const quizButtons = document.getElementById('quizButtons');
  const quizFeedback = document.getElementById('quizFeedback');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackText = document.getElementById('feedbackText');
  const redFlags = document.getElementById('redFlags');
  const nextBtn = document.getElementById('nextBtn');
  const quizCounter = document.getElementById('quizCounter');
  const quizScore = document.getElementById('quizScore');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizFinal = document.getElementById('quizFinal');
  const finalScore = document.getElementById('finalScore');
  const finalMessage = document.getElementById('finalMessage');
  const restartBtn = document.getElementById('restartBtn');
  const emailCard = document.getElementById('emailCard');

  if (emailFrom && quizButtons) {
    console.log('✅ Phishing quiz loaded');

    const loadQuestion = () => {
      const q = phishingQuestions[currentQuestion];
      answered = false;

      emailFrom.textContent = q.from;
      emailSubject.textContent = q.subject;
      emailBody.textContent = q.body;

      quizCounter.textContent = `Question ${currentQuestion + 1} of ${phishingQuestions.length}`;
      quizScore.textContent = `Score: ${currentScore}`;
      quizProgressFill.style.width = `${(currentQuestion / phishingQuestions.length) * 100}%`;

      quizButtons.style.display = 'flex';
      quizFeedback.hidden = true;
      emailCard.style.display = 'block';
    };

    const handleAnswer = (choice) => {
      if (answered) return;
      answered = true;

      const q = phishingQuestions[currentQuestion];
      const isCorrect = choice === q.answer;
      if (isCorrect) currentScore++;

      quizScore.textContent = `Score: ${currentScore}`;
      quizFeedback.hidden = false;
      quizFeedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;
      feedbackTitle.textContent = isCorrect ? '✅ Correct!' : '❌ Not quite.';
      feedbackText.textContent = q.explanation;

      redFlags.innerHTML = '';
      q.flags.forEach(flag => {
        const li = document.createElement('li');
        li.textContent = flag;
        redFlags.appendChild(li);
      });

      quizButtons.style.display = 'none';
    };

    const showFinal = () => {
      emailCard.style.display = 'none';
      quizButtons.style.display = 'none';
      quizFeedback.hidden = true;
      quizFinal.hidden = false;
      quizProgressFill.style.width = '100%';
      finalScore.textContent = `${currentScore} / ${phishingQuestions.length}`;

      const pct = (currentScore / phishingQuestions.length) * 100;
      if (pct === 100) {
        finalMessage.textContent = "Perfect score! You're a phishing-spotting pro. 🛡️";
      } else if (pct >= 60) {
        finalMessage.textContent = "Good job! Review the red flags and try again to get 5/5.";
      } else {
        finalMessage.textContent = "Phishing is tricky — review the tips below and try again!";
      }
    };

    const nextQuestion = () => {
      currentQuestion++;
      if (currentQuestion < phishingQuestions.length) {
        loadQuestion();
      } else {
        showFinal();
      }
    };

    const restartQuiz = () => {
      currentQuestion = 0;
      currentScore = 0;
      quizFinal.hidden = true;
      loadQuestion();
    };

    quizButtons.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.answer));
    });
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (restartBtn) restartBtn.addEventListener('click', restartQuiz);

    loadQuestion();
  } else {
    console.warn('⚠️ Phishing quiz HTML not found — skipping quiz setup');
  }

});
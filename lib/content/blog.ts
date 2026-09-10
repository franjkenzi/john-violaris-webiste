import type { IconName } from "@/components/ui/icons";

/**
 * Blog / guides content.
 *
 * The six articles below are the six cards shown on the blog panel of
 * `johnviolaris-DEMO_3_1 (1).html` — their category, title, excerpt and read
 * time come from that file. The demo's cards were not clickable and no article
 * bodies existed anywhere in the delivered material, so the `body` blocks are
 * drafted here to match the voice of the rest of the site.
 *
 * EVERY LEGAL STATEMENT IN THESE ARTICLES MUST BE READ AND APPROVED BY JOHN
 * BEFORE LAUNCH. This is published content on an SRA-regulated site; the same
 * caveat that applies to the statute strings in `services.ts` applies here with
 * more force, because these are the pages that read as advice.
 *
 * Shape note: `body` is an array of blocks rather than a markdown string so the
 * CMS can model each section as a row later without reshaping the front end.
 */

export type ArticleBlock = {
  heading: string;
  paragraphs: string[];
  /** Optional bulleted points rendered after the paragraphs. */
  list?: string[];
};

export type Article = {
  slug: string;
  /** Category label shown on the card and above the article title. */
  category: string;
  icon: IconName;
  title: string;
  /** Card summary, and the meta description for the article page. */
  excerpt: string;
  readTime: string;
  /** Standfirst beneath the article heading. */
  standfirst: string;
  body: ArticleBlock[];
  /** Service page this article should send the reader to. */
  relatedService: string;
};

export const articles: Article[] = [
  {
    slug: "what-happens-after-a-drink-driving-arrest",
    category: "Drink Driving",
    icon: "glass",
    title: "What happens after a drink driving arrest? A step-by-step guide",
    excerpt:
      "From the roadside breath test to the magistrates’ court hearing — what to expect at each stage.",
    readTime: "8 min read",
    standfirst:
      "Most people arrested for drink driving have never been arrested before. Knowing the order things happen in removes some of the fear, and helps you understand where the decisions that matter actually fall.",
    body: [
      {
        heading: "At the roadside",
        paragraphs: [
          "A police officer who has reasonable grounds to suspect that you have alcohol in your body, or who stops you after a moving traffic offence or a collision, can require a preliminary breath test at the roadside.",
          "That roadside device is a screening tool. It is not the reading used to prosecute you. Its purpose is to establish whether there are grounds to arrest, and its result is not usually evidence of the offence itself.",
        ],
      },
      {
        heading: "At the police station",
        paragraphs: [
          "The evidential procedure takes place at the station, on an approved device. This is the reading the prosecution will rely on, and it is the stage at which most of the issues capable of affecting the outcome arise.",
          "The procedure is prescriptive. The officer must follow it, must give you specific warnings, and in defined circumstances must offer you the option of replacing a breath specimen with blood or urine. Whether all of that happened correctly is a proper subject of scrutiny.",
        ],
        list: [
          "You are entitled to free legal advice at the police station, at any hour",
          "That right applies before and during any interview",
          "Asking for a solicitor does not make you look guilty, and does not delay matters as much as people expect",
        ],
      },
      {
        heading: "Charge and bail",
        paragraphs: [
          "If you are charged, you will be given a charge sheet setting out the allegation and a date to attend the magistrates’ court. You are usually released on bail to that date.",
          "Keep every document you are given. The charge sheet, the printout from the station device and any custody record all matter, and they are the first things a solicitor will ask to see.",
        ],
      },
      {
        heading: "Before the hearing",
        paragraphs: [
          "This is the stage where instructing a solicitor makes the greatest difference. The evidence can be requested and examined, the procedure at the station can be checked, and you can be advised properly on plea before you are asked to enter one.",
          "It is much harder to undo a guilty plea entered at the first hearing than it is to take a short time to get advice first.",
        ],
      },
      {
        heading: "At court",
        paragraphs: [
          "Drink driving is heard in the magistrates’ court. If you plead not guilty, a trial date is set. If you plead guilty, or are convicted, the court moves to sentence.",
          "On conviction the disqualification is a minimum of twelve months, and longer where the reading is high or there is a previous conviction within ten years. That is why the work done before the hearing matters so much.",
        ],
      },
      {
        heading: "Where there is still room to argue",
        paragraphs: [
          "Even where the offence itself is not in dispute, a special reasons argument can ask the court not to disqualify — for example where a drink was laced, where there was a genuine emergency, or where the distance driven was very short.",
          "These arguments require evidence, and usually expert evidence. They are not put together on the morning of the hearing.",
        ],
      },
    ],
    relatedService: "/services/drink-driving",
  },

  {
    slug: "exceptional-hardship-what-the-court-looks-for",
    category: "Totting Up",
    icon: "points",
    title: "Exceptional hardship: what the court is actually looking for",
    excerpt:
      "Most exceptional hardship arguments fail. This guide explains the legal test and the evidence you need.",
    readTime: "6 min read",
    standfirst:
      "Reaching twelve penalty points means a six-month disqualification unless the court is persuaded that it would cause exceptional hardship. The argument succeeds far less often than people expect, and it usually fails for reasons that were avoidable.",
    body: [
      {
        heading: "The test is not inconvenience",
        paragraphs: [
          "Every disqualification is inconvenient. Losing your licence makes work harder, family life harder and everything slower. None of that is exceptional, because it is true of every driver who is banned.",
          "What the court is looking for is hardship that goes beyond the ordinary consequences of losing a licence. The clearest way to demonstrate that is to show the effect on people other than yourself.",
        ],
      },
      {
        heading: "Hardship to other people carries the most weight",
        paragraphs: [
          "Arguments that succeed tend to involve consequences for third parties: employees who would lose their jobs if the business could not operate, a dependant relative who relies on you for care and transport, or clients in a remote area who could not be reached another way.",
          "An argument built only on the effect on you is much weaker, even where that effect is genuinely serious.",
        ],
      },
      {
        heading: "Losing your job is not, by itself, enough",
        paragraphs: [
          "Courts hear that a driver will lose their job in a large proportion of these applications. Standing alone, it rarely persuades.",
          "What can persuade is what follows from it — that the mortgage cannot be paid and the family would lose their home, that a business would close and other people would be put out of work, or that a specific care arrangement would collapse.",
        ],
      },
      {
        heading: "Bring evidence, not assertions",
        paragraphs: [
          "This is where most applications come apart. The court is being asked to depart from a mandatory penalty, and it expects to be given a proper basis for doing so.",
        ],
        list: [
          "Employment contracts, payslips and correspondence from your employer",
          "Business accounts, and evidence of what the business does and who it employs",
          "Medical evidence where a dependant’s health or care needs are relied on",
          "Statements from the people affected — and, where possible, their attendance at court",
          "Evidence about public transport, taxis or other drivers, and why they would not solve the problem",
        ],
      },
      {
        heading: "You will be asked questions",
        paragraphs: [
          "You will usually give evidence yourself, on oath, and you can expect to be challenged on whether the hardship is really exceptional and whether there is another way around it.",
          "Preparation for that is part of the work. So is knowing which questions are coming.",
        ],
      },
      {
        heading: "You generally get one go",
        paragraphs: [
          "Where the court accepts an exceptional hardship argument, the same circumstances cannot usually be relied on again within the following three years.",
          "That is worth knowing before the argument is run, because it affects whether this is the right occasion to run it.",
        ],
      },
    ],
    relatedService: "/services/exceptional-hardship",
  },

  {
    slug: "mobile-phone-driving-law-changes",
    category: "Mobile Phone",
    icon: "phone",
    title: "The 2022 mobile phone driving law changes explained",
    excerpt:
      "The law was fundamentally rewritten. This guide explains exactly what is now prohibited.",
    readTime: "5 min read",
    standfirst:
      "In March 2022 the law on using a mobile phone while driving was rewritten and significantly widened. A great deal that was lawful before is not lawful now, and six points is a serious penalty for anyone with existing points on their licence.",
    body: [
      {
        heading: "What changed",
        paragraphs: [
          "The previous law was directed at interactive communication — calls, texts and similar. That left a gap: courts had accepted that some standalone uses of a phone, such as recording a video, did not fall within the wording.",
          "The rewritten regulations close that gap. The offence now covers using a hand-held device for a much broader range of functions, whether or not it involves communicating with anyone.",
        ],
      },
      {
        heading: "What is now prohibited",
        paragraphs: [
          "Holding a phone or similar device while driving and using it for essentially any of its functions is now caught.",
        ],
        list: [
          "Making or receiving a call",
          "Sending, receiving or reading any kind of message",
          "Taking photographs or recording video, and scrolling through them",
          "Browsing the internet or using apps",
          "Selecting music or other stored content",
          "Using it to check the time, or simply unlocking it",
        ],
      },
      {
        heading: "The word that matters is 'held'",
        paragraphs: [
          "The offence turns on holding the device. A phone in a proper cradle, operated in a way that does not involve holding it, is treated differently — though driving without proper control remains a separate offence if attention is taken from the road.",
          "Hands-free use is not caught by this particular offence. That does not make it risk-free in every circumstance.",
        ],
      },
      {
        heading: "Stationary in traffic is still driving",
        paragraphs: [
          "One of the most common misunderstandings is that a queue of traffic or a red light stops you from driving for these purposes. It does not.",
          "Being safely parked with the engine off is a different matter.",
        ],
      },
      {
        heading: "The exceptions that do exist",
        paragraphs: [
          "The regulations kept some genuine exceptions, and they can be decisive in the right case.",
        ],
        list: [
          "Calling 999 or 112 in a genuine emergency, where it is unsafe or impracticable to stop",
          "Making a contactless payment while stationary, for goods or services received at the same time — a drive-through or a toll barrier, for example",
          "Using a device for remote-controlled parking as designed",
        ],
      },
      {
        heading: "Why six points is not a minor matter",
        paragraphs: [
          "Six points is half of the twelve that trigger a totting-up disqualification. For a driver who already has six points, accepting a fixed penalty means a ban.",
          "For anyone within two years of passing their test, six points means the licence is revoked and the test must be taken again. In both situations, the notice should not be accepted without advice.",
        ],
      },
    ],
    relatedService: "/services/mobile-phone",
  },

  {
    slug: "laced-drinks-and-drink-driving",
    category: "Special Reasons",
    icon: "spark",
    title: "Laced drinks: can it really prevent a drink driving disqualification?",
    excerpt:
      "Sometimes — but the legal test is stringent. This guide sets out what the court requires.",
    readTime: "7 min read",
    standfirst:
      "The laced drink argument is well known and frequently misunderstood. It is a real argument, and it does succeed — but it is not a defence to the offence, and it is not established simply by saying it happened.",
    body: [
      {
        heading: "It is not a defence to the charge",
        paragraphs: [
          "This is the point people most often get wrong. If you were over the limit and you drove, the offence is committed, whatever you believed you were drinking.",
          "A laced drink argument is a special reasons argument. You are convicted of the offence, but you ask the court to exercise its discretion not to disqualify you. The conviction stands; the ban is what is in issue.",
        ],
      },
      {
        heading: "What you have to establish",
        paragraphs: [
          "The burden is on you, and there are three limbs the court will look at.",
        ],
        list: [
          "That your drink was in fact laced, or that you were given alcohol without knowing it",
          "That you did not know and had no reason to suspect that what you were drinking was or had been strengthened",
          "That, but for the additional alcohol, you would have been under the limit",
        ],
      },
      {
        heading: "The third limb is where most arguments fail",
        paragraphs: [
          "It is not enough that someone added alcohol to your drink. You have to show that without it you would have been below the limit.",
          "If you had already drunk enough to be over the limit on your own account, the lacing made no difference to whether the offence was committed, and the argument does not get off the ground.",
        ],
      },
      {
        heading: "You will usually need expert evidence",
        paragraphs: [
          "Establishing that third limb normally requires a forensic report. An expert works from what you drank, when, your body weight and the reading obtained, and calculates what your level would have been without the added alcohol.",
          "Courts are used to seeing these reports and are generally unwilling to accept the argument without one.",
        ],
      },
      {
        heading: "The court also asks whether you should have realised",
        paragraphs: [
          "Even where the calculation works, the court will consider whether you ought to have appreciated that you were unfit or over the limit before you decided to drive.",
          "If you felt noticeably affected and drove anyway, that can defeat the argument even where the drink was genuinely laced.",
        ],
      },
      {
        heading: "What helps",
        paragraphs: [
          "Evidence gathered early is worth far more than recollection months later.",
        ],
        list: [
          "The name of the person who laced the drink, and ideally their evidence",
          "Witnesses who were with you and can say what you drank",
          "Receipts, card statements or venue CCTV establishing what was bought",
          "A clear, contemporaneous account of the evening while it is fresh",
        ],
      },
      {
        heading: "It is a discretion, not an entitlement",
        paragraphs: [
          "Even where all three limbs are established, the court is not obliged to allow you to keep your licence. It retains a discretion, and it will exercise it having regard to all the circumstances.",
          "That is why these arguments are prepared properly or not at all.",
        ],
      },
    ],
    relatedService: "/services/special-reasons",
  },

  {
    slug: "notice-of-intended-prosecution",
    category: "Speeding",
    icon: "mail",
    title: "Received a Notice of Intended Prosecution? Here’s what to do",
    excerpt:
      "A NIP triggers strict time limits and legal obligations. Missing deadlines can worsen your position.",
    readTime: "4 min read",
    standfirst:
      "A Notice of Intended Prosecution is not a charge, and it is not a fine. It is the start of a process with short deadlines attached, and the way you respond to it can matter more than the original allegation.",
    body: [
      {
        heading: "What the notice is",
        paragraphs: [
          "For a range of offences — speeding, careless driving and some others — the police must warn the driver that prosecution is being considered. For camera-detected offences that warning arrives by post, addressed to the registered keeper.",
          "It normally arrives with a separate request for driver details under section 172.",
        ],
      },
      {
        heading: "The fourteen-day rule, and what it actually means",
        paragraphs: [
          "The notice must generally be served on the registered keeper within fourteen days of the alleged offence. Service is on the keeper, not on the driver, so a notice that reaches a company promptly is properly served even if it takes longer to reach the person who was driving.",
          "Late service can be fatal to the prosecution, but the point needs to be taken correctly rather than assumed. Keep the envelope.",
        ],
      },
      {
        heading: "The request for driver details is the urgent part",
        paragraphs: [
          "The obligation to identify the driver carries a twenty-eight day deadline, and ignoring it is far more serious than most people realise.",
          "Failing to provide driver details carries six penalty points — often more than the speeding offence that prompted the notice, and enough on its own to put a licence at risk.",
        ],
      },
      {
        heading: "What to do",
        paragraphs: ["In order, and without delay:"],
        list: [
          "Note the date the notice arrived, and keep the envelope",
          "Do not ignore it, and do not put it aside to deal with later",
          "If you genuinely cannot identify the driver, record what enquiries you make and when",
          "Take advice before responding if you already have points on your licence",
          "Return the response within the time limit, by a method that gives you proof of posting",
        ],
      },
      {
        heading: "If you cannot identify the driver",
        paragraphs: [
          "There is a statutory defence where you could not, with reasonable diligence, establish who was driving. It is a real defence, but it succeeds on evidence rather than assertion.",
          "That means showing what you actually did: who you asked, when, what records you checked and what answers you received. Contemporaneous notes are worth a great deal here.",
        ],
      },
      {
        heading: "Think before accepting a fixed penalty",
        paragraphs: [
          "A fixed penalty is often the sensible course. But if the points would take you to twelve, accepting it means a disqualification, and the opportunity to argue exceptional hardship at a hearing is lost.",
          "Check your existing points before you sign anything.",
        ],
      },
    ],
    relatedService: "/services/speeding",
  },

  {
    slug: "answering-questions-in-a-police-interview",
    category: "Police Station",
    icon: "shield",
    title: "Should you answer questions in a police interview?",
    excerpt:
      "The decision to answer, give a statement, or remain silent is one of the most important decisions in any case.",
    readTime: "6 min read",
    standfirst:
      "There is no single right answer, and anyone who gives you one without knowing what the police have is guessing. What there is, is a way of approaching the decision — and one thing you should always do first.",
    body: [
      {
        heading: "Get a solicitor first. It is free.",
        paragraphs: [
          "Advice at the police station is free to everyone, at any hour, regardless of means. It is not a service you have to qualify for and it is not something you are charged for afterwards.",
          "Asking for a solicitor does not suggest guilt, and it does not add the delay people imagine. It is the single most useful thing you can do at that stage.",
        ],
      },
      {
        heading: "Why disclosure matters before anything else",
        paragraphs: [
          "Before an interview, your solicitor is entitled to ask the officer what the allegation is and what evidence there is to support it. That conversation is the basis of every decision that follows.",
          "You cannot sensibly decide whether to answer questions when you do not know what is being put to you. Neither can anyone advising you.",
        ],
      },
      {
        heading: "The three options",
        paragraphs: [
          "Broadly, there are three courses, and each is right in different circumstances.",
        ],
        list: [
          "Answering questions — where you have a clear account that is supported by the evidence, and putting it early can resolve matters",
          "A prepared statement — a written account handed in, after which you decline to answer questions, giving your account without being drawn beyond it",
          "No comment — where disclosure is inadequate, where the position is genuinely unclear, or where you are unwell or unfit to be interviewed",
        ],
      },
      {
        heading: "What the caution really means",
        paragraphs: [
          "The caution warns that it may harm your defence if you do not mention, when questioned, something you later rely on in court. That is the adverse inference, and it is why silence is not automatically the safe option.",
          "But an inference can only be drawn in defined circumstances, and it cannot be drawn where you remained silent on legal advice for a reason that was proper at the time. That is another reason the advice itself matters.",
        ],
      },
      {
        heading: "A prepared statement is often the middle course",
        paragraphs: [
          "It puts your account on record at the earliest stage, which addresses the risk of an adverse inference, while avoiding hours of questioning about matters you may not remember precisely.",
          "It has to be drafted carefully. An account that is inaccurate in a detail can cause more difficulty later than saying nothing would have.",
        ],
      },
      {
        heading: "Things worth knowing",
        paragraphs: [],
        list: [
          "A voluntary interview is still a formal interview, under caution, with the same consequences",
          "You are entitled to free legal advice at a voluntary interview too",
          "You can ask for a break to speak to your solicitor privately at any point",
          "Nothing said in the interview room is off the record",
        ],
      },
      {
        heading: "The stage that shapes everything after",
        paragraphs: [
          "Cases are frequently decided by what happens in the interview room, long before anyone reaches a courtroom. An account given without advice, under pressure and without knowing what the police hold, can be very difficult to move away from later.",
          "John has attended police stations since 2003. If you have been asked to attend an interview, speak to him before you go.",
        ],
      },
    ],
    relatedService: "/police-station",
  },
];

export function findArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

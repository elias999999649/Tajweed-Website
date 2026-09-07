import type { TajweedTopic } from "@/lib/taxonomy/types";
import type { QuranExampleRecord } from "@/lib/quran-examples/types";

export type RuleExample = QuranExampleRecord;

export type RulePageContent = {
  topicId: string;
  introduction: string;
  whatIsIt: string;
  whenItOccurs: string;
  letters: string[];
  letterNote: string;
  pronunciation: string;
  mistakes: string[];
  distinctions: Array<{ title: string; text: string; relatedTopicId?: string }>;
  memoryTip: string;
  exercises: string[];
  quiz: Array<{ question: string; options: string[]; answer: number }>;
  faq: Array<{ question: string; answer: string }>;
  examples: RuleExample[];
  editorialNote?: string;
};

const reviewedLater = "This explanation is a structured editorial draft. A qualified Tajweed reviewer must approve its wording, letter lists, examples, and audio before publication.";

export const rulePageContent: Record<string, RulePageContent> = {
  "ikhfa": {
    topicId: "ikhfa",
    introduction: "Ikhfa is studied as one of the Noon Sakinah and Tanween cases. This page helps you recognise the condition and prepare to listen for its sound; a teacher or qualified reciter should confirm the pronunciation in practice.",
    whatIsIt: "Ikhfa is traditionally described as a partially concealed treatment of Noon Sakinah or Tanween when the specified following letter is present. The exact sound, nasal quality, and timing should be learned from a verified demonstration rather than from spelling alone.",
    whenItOccurs: "It occurs when Noon Sakinah or Tanween is followed by one of the letters assigned to the Ikhfa case in the selected reading tradition.",
    letters: ["ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ف", "ق", "ك"],
    letterNote: "The letter inventory shown here follows the common Hafs teaching classification and requires qualified editorial approval before publication.",
    pronunciation: "Keep the sound between a fully clear Noon and a fully merged sound, while following the nasal and articulation guidance demonstrated by a qualified teacher. Do not try to derive the complete performance from the written highlight.",
    mistakes: ["Reading the Noon fully clear in every context.", "Merging as though the next letter had completely absorbed the Noon.", "Treating a written color as a substitute for listening and correction."],
    distinctions: [{ title: "Izhar", text: "Izhar is the clear-reading case in the Noon Sakinah and Tanween family; Ikhfa is a different following-letter condition.", relatedTopicId: "izhar" }, { title: "Idgham", text: "Idgham involves merging in its assigned cases. Do not use the visual similarity of a highlight to decide which rule applies.", relatedTopicId: "idgham" }],
    memoryTip: "First identify the Noon Sakinah or Tanween, then inspect the next letter. Memorise the classification only after you can recognise the pattern in a verified example.",
    exercises: ["Underline every Noon Sakinah or Tanween in a verified exercise set, then label the following letter.", "Listen to two approved demonstrations and write one difference you hear.", "Read a short, reviewer-approved line while a teacher checks the target sound."],
    quiz: [{ question: "What should you check first when studying Ikhfa?", options: ["The page colour", "The Noon Sakinah or Tanween and the following letter", "The English translation"], answer: 1 }, { question: "What is the safest way to learn the sound?", options: ["Infer it from transliteration", "Listen to a qualified demonstration and practise", "Skip the audio and memorise the name"], answer: 1 }],
    faq: [{ question: "Is Ikhfa only about the Noon letter?", answer: "It is taught in connection with Noon Sakinah and Tanween. The exact condition and performance should be confirmed against the selected reading tradition." }, { question: "Can I learn Ikhfa from text alone?", answer: "Text can support recognition, but correct pronunciation and nasal quality require listening, repetition, and feedback." }],
    examples: [],
    editorialNote: reviewedLater,
  },
  "idgham": {
    topicId: "idgham",
    introduction: "Idgham is studied as a merging case within the Noon Sakinah and Tanween family. This page separates recognition from pronunciation so learners know what to look for before listening and repeating.",
    whatIsIt: "Idgham is traditionally described as merging the relevant Noon Sakinah or Tanween sound into a following letter in its assigned cases. Its subcategories and sound behavior must be taught with a verified demonstration.",
    whenItOccurs: "It occurs when Noon Sakinah or Tanween is followed by one of the letters assigned to Idgham in the selected reading tradition.",
    letters: ["ي", "ر", "م", "ل", "و", "ن"],
    letterNote: "The letters shown are the commonly taught Idgham inventory for Noon Sakinah and Tanween; the division of subcases must be reviewed before publication.",
    pronunciation: "Allow the relevant sound to merge according to the subcase being studied. Do not add an audible extra vowel or force a pause between the two parts. Use a qualified reciter's demonstration for the precise performance.",
    mistakes: ["Reading the Noon or Tanween as fully separate in every case.", "Applying Idgham to a letter outside the selected classification.", "Treating every Idgham case as though it has identical nasal behavior."],
    distinctions: [{ title: "Izhar", text: "Izhar keeps the relevant sound clear in its own case; Idgham is the merging case.", relatedTopicId: "izhar" }, { title: "Idgham Shafawi", text: "Idgham Shafawi belongs to the Meem Sakinah family and should not be confused with Noon Sakinah and Tanween Idgham.", relatedTopicId: "idgham-shafawi" }],
    memoryTip: "Start with the trigger: identify Noon Sakinah or Tanween, then inspect the following letter and the subcase before you think about sound.",
    exercises: ["Sort a verified exercise set into Idgham and non-Idgham cases.", "Listen to approved examples and mark whether the relevant subcase includes nasal guidance.", "Practise one subcase at a time with teacher feedback."],
    quiz: [{ question: "What makes Idgham different from Izhar?", options: ["The relevant sound is merged in its assigned cases", "The text is always longer", "It only occurs at a stop"], answer: 0 }, { question: "What should determine whether Idgham applies?", options: ["A decorative colour", "The following letter and selected classification", "The English meaning alone"], answer: 1 }],
    faq: [{ question: "Does every Noon Sakinah trigger Idgham?", answer: "No. The following letter determines which Noon Sakinah or Tanween case applies." }, { question: "Are all Idgham cases pronounced the same way?", answer: "No. The subcase and reading tradition matter, which is why listening guidance is essential." }],
    examples: [],
    editorialNote: reviewedLater,
  },
  "iqlab": {
    topicId: "iqlab",
    introduction: "Iqlab is a specific Noon Sakinah and Tanween case. This page explains the recognition pattern while keeping the sound demonstration separate and teacher-led.",
    whatIsIt: "Iqlab is traditionally described as a change in the treatment of Noon Sakinah or Tanween before its assigned following letter. The precise nasal and lip behavior should be learned from a qualified demonstration.",
    whenItOccurs: "It occurs when Noon Sakinah or Tanween is followed by the letter assigned to Iqlab in the selected reading tradition.",
    letters: ["ب"],
    letterNote: "The single trigger shown is the common teaching classification for Iqlab and must still be approved for the site's selected reading scope.",
    pronunciation: "Prepare the sound according to the demonstrated Iqlab treatment, paying attention to the transition toward the lips and the associated nasal quality. Written transliteration is not sufficient to reproduce it accurately.",
    mistakes: ["Reading the Noon fully unchanged before Baa.", "Skipping the nasal component or changing the timing without guidance.", "Confusing Iqlab with the general idea of every concealed Noon."],
    distinctions: [{ title: "Ikhfa", text: "Ikhfa has its own following-letter set. Iqlab is the specific case associated with its assigned trigger.", relatedTopicId: "ikhfa" }, { title: "Izhar", text: "Izhar is a clear-reading case and does not describe the Iqlab treatment.", relatedTopicId: "izhar" }],
    memoryTip: "For recognition, remember that Iqlab has one trigger in the common teaching classification. For pronunciation, rely on listening rather than a mnemonic alone.",
    exercises: ["Find the trigger letter in a verified exercise set after Noon Sakinah or Tanween.", "Listen for the transition and describe what changes without trying to imitate unsupervised.", "Repeat a short approved example with a teacher."],
    quiz: [{ question: "What identifies the common Iqlab case?", options: ["The following Baa", "Any following letter", "Only a stop sign"], answer: 0 }, { question: "What should supplement the written explanation?", options: ["A qualified audio demonstration", "A guessed transliteration", "No practice"], answer: 0 }],
    faq: [{ question: "Why is listening especially important for Iqlab?", answer: "The written condition helps recognition, but the sound transition and nasal behavior are learned through a reliable demonstration and practice." }],
    examples: [],
    editorialNote: reviewedLater,
  },
  "izhar": {
    topicId: "izhar",
    introduction: "Izhar is the clear-reading case taught within the Noon Sakinah and Tanween family. This page helps you identify its condition before practising the sound with guidance.",
    whatIsIt: "Izhar is traditionally described as reading the relevant Noon Sakinah or Tanween clearly in its assigned cases, without applying the merging or concealment treatment of the other cases.",
    whenItOccurs: "It occurs when Noon Sakinah or Tanween is followed by one of the letters assigned to the clear-reading case in the selected reading tradition.",
    letters: ["ء", "ه", "ع", "ح", "غ", "خ"],
    letterNote: "These are commonly taught as the throat-letter triggers for Izhar; the classification and examples still require qualified editorial approval.",
    pronunciation: "Read the Noon Sakinah or Tanween clearly, then move to the following letter without inserting an unsourced pause or changing the sound beyond what the qualified demonstration shows.",
    mistakes: ["Concealing the Noon even when the clear-reading condition applies.", "Merging the sound into the following letter.", "Adding an extra vowel between the two sounds."],
    distinctions: [{ title: "Ikhfa", text: "Ikhfa is a different following-letter condition with a different sound treatment.", relatedTopicId: "ikhfa" }, { title: "Idgham", text: "Idgham merges in its assigned cases; Izhar keeps the relevant sound clear.", relatedTopicId: "idgham" }],
    memoryTip: "Recognition comes from the next letter. Learn the trigger set, then let an approved recording establish what ‘clear’ sounds like in practice.",
    exercises: ["Mark the following letter in a verified exercise and decide whether the clear-reading condition applies.", "Read a controlled pair of examples: one Izhar case and one non-Izhar case.", "Ask a teacher to check that the Noon remains clear without an added vowel."],
    quiz: [{ question: "What is the central recognition step for Izhar?", options: ["Check the following letter", "Count English words", "Ignore the diacritics"], answer: 0 }, { question: "What should the learner avoid?", options: ["A clear transition", "Unplanned concealment or merging", "Listening"], answer: 1 }],
    faq: [{ question: "Does Izhar mean stopping?", answer: "No. Izhar describes a sound treatment in its assigned cases; Waqf is the study of stopping." }],
    examples: [],
    editorialNote: reviewedLater,
  },
  "qalqalah": {
    topicId: "qalqalah",
    introduction: "Qalqalah is a letter-quality topic commonly introduced after articulation and Sifaat. This page focuses on recognition and listening rather than reducing the sound to an English approximation.",
    whatIsIt: "Qalqalah is traditionally described as a characteristic of the assigned letters when they carry sukoon, with the exact degree depending on the context being taught. A qualified reciter should demonstrate the sound.",
    whenItOccurs: "It occurs when one of the assigned Qalqalah letters is sakin in the context defined by the selected curriculum and reading tradition.",
    letters: ["ق", "ط", "ب", "ج", "د"],
    letterNote: "The displayed set is the commonly taught Qalqalah set. The page should later distinguish contextual degrees only after qualified review.",
    pronunciation: "Keep the articulation point of the letter and avoid turning Qalqalah into an added vowel. Listen for the approved demonstration and practise the controlled release with feedback.",
    mistakes: ["Adding a full vowel after the letter.", "Replacing the letter's articulation with an English approximation.", "Treating every context as the same degree of Qalqalah."],
    distinctions: [{ title: "Madd", text: "Qalqalah is not a lengthening rule. Do not use Madd timing to explain a Qalqalah sound.", relatedTopicId: "madd-tabii" }, { title: "Waqf", text: "Stopping can change the context in which a letter is heard, but Waqf and Qalqalah are separate topics.", relatedTopicId: "waqf" }],
    memoryTip: "Remember the letter set for recognition, then focus on keeping the original articulation while avoiding an added vowel.",
    exercises: ["Circle the assigned Qalqalah letters in a verified exercise set and check their vowel state.", "Compare a sakin and non-sakin occurrence in approved audio.", "Repeat short examples while a teacher checks articulation and vowel intrusion."],
    quiz: [{ question: "What should you avoid when practising Qalqalah?", options: ["Keeping the articulation point", "Adding a full vowel after the letter", "Listening to a demonstration"], answer: 1 }, { question: "What is Qalqalah primarily connected to?", options: ["An assigned letter quality in a defined sukoon context", "English translation", "Page layout"], answer: 0 }],
    faq: [{ question: "Is Qalqalah the same as adding an echoing vowel?", answer: "No. The learner should not add a full vowel. The precise performance needs to be heard and corrected by a qualified teacher or reciter." }],
    examples: [],
    editorialNote: reviewedLater,
  },
};

export function getRulePageContent(topic: TajweedTopic) {
  return rulePageContent[topic.id] ?? {
    topicId: topic.id,
    introduction: topic.summary,
    whatIsIt: "This rule page is being prepared from the approved taxonomy and source review process.",
    whenItOccurs: "The exact condition will be published after qualified review for the selected reading tradition.",
    letters: [], letterNote: "Letters will be added only after verification.", pronunciation: "Pronunciation guidance will be added with an approved audio demonstration.", mistakes: [], distinctions: [], memoryTip: "Return to the prerequisite lesson and practise with a teacher.", exercises: [], quiz: [], faq: [], examples: [], editorialNote: reviewedLater,
  } satisfies RulePageContent;
}

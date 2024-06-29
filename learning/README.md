# Vocabulary Quiz with Audio Feedback

## Usage

1. **Prepare Vocabulary File:**
   - Create a text file named `foreign_native.txt` with vocabulary pairs formatted as `foreign word - native word` on each line. For example:
     ```
     Guten Tag - Dzień dobry
     Haus - Dom
     ```

2. **Run the Script:**
   - Execute the script by typing:
     ```bash
     python quiz_script.py
     ```
   - The script will load the vocabulary from `foreign_native.txt` and start the quiz.

3. **Quiz Interaction:**
   - During the quiz, the script will randomly present foreign words (German) and a list of possible native translations (Polish).
   - Listen to the pronunciation of the foreign word (audio feedback).
   - Choose the correct translation using the UP and DOWN arrow keys to navigate through options and confirm your choice by pressing SPACEBAR.

4. **Quiz Results:**
   - After answering all questions, the script will display your score in the format:
     ```
     Quiz complete. You got X/Y correct.
     ```
   - Where `X` is the number of correct answers and `Y` is the total number of questions.

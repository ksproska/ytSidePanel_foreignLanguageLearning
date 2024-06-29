import random
import sys

import readchar

from gtts import gTTS
import os


def load_dictionary(filename):
    word_dict = {}
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            for line in file:
                parts = line.strip().split(' - ')
                if len(parts) == 2:
                    word_dict[parts[0].strip()] = parts[1].strip()
    except FileNotFoundError:
        print(f"Error: The file '{filename}' does not exist.")
    return word_dict


def save_mp3s(german, polish):
    tts_foreign = gTTS(text=german, lang='de')
    tts_native = gTTS(text=polish, lang='pl')
    tts_foreign.save('temp_foreign.mp3')
    tts_native.save('temp_native.mp3')


def play_mp3(lang):
    os.system(f'mpg123 temp_{lang}.mp3 > /dev/null 2>&1')


def cleanup_mp3s():
    if os.path.exists('temp_foreign.mp3'):
        os.remove('temp_foreign.mp3')
    if os.path.exists('temp_native.mp3'):
        os.remove('temp_native.mp3')


def choose_answers(correct_answer, all_answers, n=4):
    options = [correct_answer]
    while len(options) < n:
        choice = random.choice(list(all_answers))
        if choice not in options:
            options.append(choice)
    random.shuffle(options)
    return options


def quiz(word_dict):
    correct_count = 0
    max_length_native = max(len(w) for w in list(word_dict.values()))
    max_length_foreign = max(len(w) for w in word_dict.keys())

    items = list(word_dict.items())
    random.shuffle(items)

    for i, (foreign, native) in enumerate(items):
        print()
        choices = choose_answers(native, list(word_dict.values()))

        item_inx = f'{i+1}'.rjust(3)
        formatted_foreign = f"{item_inx}/{len(word_dict.keys())} | " + f"{foreign}".ljust(max_length_foreign + 2)
        formatted_choices = [f"{choice.ljust(max_length_native)}" for index, choice in enumerate(choices)]

        chosen_inx = 0
        formatted_choices_colored = formatted_choices.copy()
        formatted_choices_colored[chosen_inx] = f"\033[93m{formatted_choices[chosen_inx]}\033[0m"
        print(f"{formatted_foreign}| {' | '.join(formatted_choices_colored)}")

        save_mp3s(foreign, native)
        play_mp3('foreign')

        while True:
            key = readchar.readkey()
            if key == readchar.key.UP:
                chosen_inx = (len(choices) + chosen_inx - 1) % len(choices)
            elif key == readchar.key.DOWN:
                chosen_inx = (chosen_inx + 1) % len(choices)
            elif key == readchar.key.SPACE:
                break

            formatted_choices_colored = formatted_choices.copy()
            formatted_choices_colored[chosen_inx] = f"\033[93m{formatted_choices[chosen_inx]}\033[0m"
            print(f"\033[A\033[K{formatted_foreign}| {' | '.join(formatted_choices_colored)}")

        print("\033[A\033[K", end='')

        correct_index = choices.index(native)

        if choices[chosen_inx] == native:
            correct_count += 1
            formatted_choices[chosen_inx] = f"\033[92m{formatted_choices[chosen_inx]}\033[0m"
        else:
            formatted_choices[chosen_inx] = f"\033[91m{formatted_choices[chosen_inx]}\033[0m"
            formatted_choices[correct_index] = f"\033[92m{formatted_choices[correct_index]}\033[0m"

        print(f"\n\033[A\033[K{formatted_foreign}| {' | '.join(formatted_choices)}")

        play_mp3('foreign')
        play_mp3('native')

    cleanup_mp3s()
    print(f"Quiz complete. You got {correct_count}/{len(word_dict)} correct.")


def main():
    filename = 'foreign_native.txt'
    word_dict = load_dictionary(filename)
    if word_dict:
        quiz(word_dict)


if __name__ == "__main__":
    main()

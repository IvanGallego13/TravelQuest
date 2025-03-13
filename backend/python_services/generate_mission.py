import sys
import openai
import os

openai.api_key = os.getenv("key open ai") 

def generate_mission(city, difficulty):
    prompt = f"Genera una misión de viaje en {city} con dificultad {difficulty}."
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": prompt}]
    )
    return response["choices"][0]["message"]["content"]

if __name__ == "__main__":
    city = sys.argv[1]
    difficulty = sys.argv[2]
    print(generate_mission(city, difficulty))

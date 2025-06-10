import logging
from aiogram import Bot, Dispatcher, types, Router
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.fsm.state import State, StatesGroup
from aiogram.filters import Command
import random
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from db.storage import (
    get_or_create_user, save_workout, get_workouts, save_nutrition_plan, get_nutrition_plans, save_user_history, get_user_history
)

API_TOKEN = '7559539827:AAF241PnOv5arbhksxUWjYAYF2_M0YZdmlI'

logging.basicConfig(level=logging.INFO)

bot = Bot(token=API_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
router = Router()

# --- FSM States ---
class PlanStates(StatesGroup):
    goal = State()
    level = State()
    equipment = State()

class NutritionStates(StatesGroup):
    calories = State()
    meals = State()

# --- Data ---
GOALS = ['Похудение', 'Набор массы', 'Гибкость и мобильность']
LEVELS = ['Новичок', 'Средний уровень', 'Опытный']
EQUIPMENT = ['Без инвентаря', 'Гантели', 'Тренажерный зал']
CALORIES = ['1500', '2000', '2500', '3000', '3500']
MEALS = ['3', '4', '5']

# Генерация тренировок для каждой комбинации
def generate_workouts(goal, level, equipment):
    # Примерные шаблоны тренировок
    base = [
        {
            'name': f"Тренировка {i+1} — {goal}, {level}, {equipment}",
            'desc': f"Описание тренировки {i+1} для цели '{goal}', уровня '{level}' и оборудования '{equipment}'."
        }
        for i in range(5)
    ]
    return base

# Генерация плана питания
FOOD_DB = [
    {'name': 'Овсяная каша', 'weight': 200, 'kcal': 140},
    {'name': 'Куриная грудка', 'weight': 150, 'kcal': 165},
    {'name': 'Салат из овощей', 'weight': 180, 'kcal': 60},
    {'name': 'Рис', 'weight': 180, 'kcal': 200},
    {'name': 'Яйца', 'weight': 100, 'kcal': 155},
    {'name': 'Творог', 'weight': 150, 'kcal': 120},
    {'name': 'Гречка', 'weight': 180, 'kcal': 170},
    {'name': 'Семга', 'weight': 120, 'kcal': 210},
    {'name': 'Банан', 'weight': 120, 'kcal': 105},
    {'name': 'Орехи', 'weight': 30, 'kcal': 200},
]

def generate_nutrition_plan(calories, meals):
    plan = []
    day_kcal = int(calories)
    for day in range(7):
        day_plan = []
        meal_kcal = day_kcal // int(meals)
        for meal in range(int(meals)):
            food = random.choice(FOOD_DB)
            # Корректируем вес для нужной калорийности
            ratio = meal_kcal / food['kcal']
            meal_weight = int(food['weight'] * ratio)
            meal_kcal_final = int(food['kcal'] * ratio)
            day_plan.append(f"{food['name']} — {meal_weight} г. ({meal_kcal_final} ккал)")
        plan.append(day_plan)
    return plan

# --- Handlers ---
@router.message(Command('start'))
async def cmd_start(message: types.Message):
    from aiogram.types import WebAppInfo
    webapp_url = "https://fitness-lilac-phi.vercel.app"
    kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Открыть WebApp", web_app=WebAppInfo(url=webapp_url))],
            [KeyboardButton(text='/plan'), KeyboardButton(text='/nutrition')]
        ],
        resize_keyboard=True
    )
    await message.answer("Привет! Я фитнес-бот. Выберите действие:", reply_markup=kb)

# --- PLAN ---
@router.message(Command('plan'))
async def cmd_plan(message: types.Message, state: FSMContext):
    user = get_or_create_user(str(message.from_user.id), message.from_user.username)
    save_user_history(str(message.from_user.id), 'start_plan', f"User started plan selection")
    kb = ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text=g)] for g in GOALS], resize_keyboard=True)
    await message.answer("Выберите цель:", reply_markup=kb)
    await state.set_state(PlanStates.goal)

@router.message(PlanStates.goal)
async def plan_goal(message: types.Message, state: FSMContext):
    if message.text not in GOALS:
        await message.reply("Пожалуйста, выберите цель из списка.")
        return
    await state.update_data(goal=message.text)
    kb = ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text=l)] for l in LEVELS], resize_keyboard=True)
    await message.answer("Выберите уровень:", reply_markup=kb)
    await state.set_state(PlanStates.level)

@router.message(PlanStates.level)
async def plan_level(message: types.Message, state: FSMContext):
    if message.text not in LEVELS:
        await message.reply("Пожалуйста, выберите уровень из списка.")
        return
    await state.update_data(level=message.text)
    kb = ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text=e)] for e in EQUIPMENT], resize_keyboard=True)
    await message.answer("Выберите оборудование:", reply_markup=kb)
    await state.set_state(PlanStates.equipment)

@router.message(PlanStates.equipment)
async def plan_equipment(message: types.Message, state: FSMContext):
    if message.text not in EQUIPMENT:
        await message.reply("Пожалуйста, выберите оборудование из списка.")
        return
    data = await state.get_data()
    goal = data['goal']
    level = data['level']
    equipment = message.text
    workouts = generate_workouts(goal, level, equipment)
    reply = f"Ваш план тренировок (цель: {goal}, уровень: {level}, оборудование: {equipment}):\n\n"
    for w in workouts:
        reply += f"\U0001F4AA {w['name']}\n{w['desc']}\n\n"
        save_workout(str(message.from_user.id), w['name'], w['desc'])
    save_user_history(str(message.from_user.id), 'save_workout_plan', f"{goal}, {level}, {equipment}")
    await message.answer(reply, reply_markup=ReplyKeyboardRemove())
    await state.clear()

# --- NUTRITION ---
@router.message(Command('nutrition'))
async def cmd_nutrition(message: types.Message, state: FSMContext):
    user = get_or_create_user(str(message.from_user.id), message.from_user.username)
    save_user_history(str(message.from_user.id), 'start_nutrition', f"User started nutrition plan selection")
    kb = ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text=c)] for c in CALORIES], resize_keyboard=True)
    await message.answer("Выберите калорийность рациона:", reply_markup=kb)
    await state.set_state(NutritionStates.calories)

@router.message(NutritionStates.calories)
async def nutrition_calories(message: types.Message, state: FSMContext):
    if message.text not in CALORIES:
        await message.reply("Пожалуйста, выберите калорийность из списка.")
        return
    await state.update_data(calories=message.text)
    kb = ReplyKeyboardMarkup(keyboard=[[KeyboardButton(text=m)] for m in MEALS], resize_keyboard=True)
    await message.answer("Сколько приемов пищи в день?", reply_markup=kb)
    await state.set_state(NutritionStates.meals)

@router.message(NutritionStates.meals)
async def nutrition_meals(message: types.Message, state: FSMContext):
    if message.text not in MEALS:
        await message.reply("Пожалуйста, выберите количество приемов пищи из списка.")
        return
    data = await state.get_data()
    calories = data['calories']
    meals = message.text
    plan = generate_nutrition_plan(calories, meals)
    plan_text = ""
    for day, meals_list in enumerate(plan, 1):
        plan_text += f"День {day}:\n"
        for meal in meals_list:
            plan_text += f"- {meal}\n"
        plan_text += "\n"
    save_nutrition_plan(str(message.from_user.id), calories, meals, plan_text)
    save_user_history(str(message.from_user.id), 'save_nutrition_plan', f"{calories} ккал, {meals} meals")
    await message.answer(f"Ваш недельный план питания:\n\n{plan_text}", reply_markup=ReplyKeyboardRemove())
    await state.clear()

import asyncio

if __name__ == '__main__':
    async def main():
        dp.include_router(router)
        await dp.start_polling(bot)
    asyncio.run(main())

export interface Quote {
  text: string;
  author: string;
  length: 'short' | 'medium' | 'long';
}

export const quotes: Quote[] = [
  {
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: "Steve Jobs",
    length: "short"
  },
  {
    text: "In the middle of difficulty lies opportunity. Life is like riding a bicycle. To keep your balance, you must keep moving.",
    author: "Albert Einstein",
    length: "short"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams. No one can make you feel inferior without your consent.",
    author: "Eleanor Roosevelt",
    length: "short"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light. The only impossible journey is the one you never begin.",
    author: "Aristotle",
    length: "short"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts. We make a living by what we get, but we make a life by what we give.",
    author: "Winston Churchill",
    length: "medium"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall. The way to get started is to quit talking and begin doing.",
    author: "Nelson Mandela",
    length: "medium"
  },
  {
    text: "You must be the change you wish to see in the world. Live as if you were to die tomorrow. Learn as if you were to live forever. Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi",
    length: "medium"
  },
  {
    text: "Two things are infinite: the universe and human stupidity; and I am not sure about the universe. Logic will get you from A to Z; imagination will get you everywhere. Learn from yesterday, live for today, hope for tomorrow.",
    author: "Albert Einstein",
    length: "medium"
  },
  {
    text: "It is not the strongest of the species that survives, nor the most intelligent that survives. It is the one that is most adaptable to change. In the long history of humankind those who learned to collaborate and improvise most effectively have prevailed.",
    author: "Charles Darwin",
    length: "long"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith. Happiness is not something ready made. It comes from your own actions. Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Franklin D. Roosevelt",
    length: "long"
  },
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. Do not go where the path may lead, go instead where there is no path and leave a trail. For every minute you are angry you lose sixty seconds of happiness.",
    author: "Ralph Waldo Emerson",
    length: "long"
  },
  {
    text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover. Life is what happens when you are busy making other plans.",
    author: "Mark Twain",
    length: "long"
  },
];

export const getRandomQuote = (length?: Quote['length']): Quote => {
  const filtered = length ? quotes.filter(q => q.length === length) : quotes;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export default quotes;

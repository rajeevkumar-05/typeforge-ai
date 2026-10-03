import { body } from 'express-validator';

export const saveTestValidator = [
  body('duration')
    .isNumeric()
    .withMessage('Duration must be a number'),
  body('wordsTyped')
    .isInt({ min: 0 })
    .withMessage('Words typed must be a non-negative integer'),
  body('charactersTyped')
    .isInt({ min: 0 })
    .withMessage('Characters typed must be a non-negative integer'),
  body('mistakes')
    .isInt({ min: 0 })
    .withMessage('Mistakes must be a non-negative integer'),
  body('rawWpm')
    .isNumeric()
    .withMessage('Raw WPM must be a number'),
  body('netWpm')
    .isNumeric()
    .withMessage('Net WPM must be a number'),
  body('accuracy')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Accuracy must be between 0 and 100'),
  body('mode')
    .isIn(['time-15', 'time-30', 'time-60', 'time-120', 'words', 'custom', 'zen', 'quote', 'code'])
    .withMessage('Invalid test mode'),
  body('language')
    .optional()
    .isString(),
  body('wpmHistory')
    .optional()
    .isArray(),
];

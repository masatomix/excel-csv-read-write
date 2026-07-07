import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default [
  {
    // src/samples はデモコード(参考用)のため lint 対象外
    ignores: ['dist/**', 'eslint.config.mjs', 'src/samples/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
      },
    },
    rules: {
      // 意図的な未使用は `_` プレフィックスで表明する
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 日本語コメント内の全角スペース(出力例の表など)は許容する
      'no-irregular-whitespace': ['error', { skipComments: true }],
    },
  },
  {
    // __tests__ は tsconfig.json の include 外(spec を exclude)のため、
    // type-aware lint を無効化して構文ベースの lint のみ適用する
    files: ['__tests__/**/*.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // テストコードではモック・フォーマッタ例のための any を許容する
    files: ['__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier,
]

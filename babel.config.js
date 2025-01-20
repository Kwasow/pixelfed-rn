module.exports = (api) => {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            src: './src',
            '@state': './src/state',
            '@hooks': './src/hooks',
            '@components': './src/components',
          },
        },
        'react-native-reanimated/plugin'
      ],
    ],
  }
}

'use strict'
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/quantum-vue/'
    : '/'
}

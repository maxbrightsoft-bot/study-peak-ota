import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface Props {
  width?: number
  height?: number
}

const Google = ({ width = 12, height = 12 }: Props) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.73 1.22 9.24 3.61l6.9-6.9C35.98 2.4 30.4 0 24 0 14.64 0 6.6 5.48 2.7 13.44l8.04 6.24C12.5 13.5 17.78 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.14-3.14-.4-4.64H24v9h12.4c-.54 2.9-2.2 5.36-4.68 7l7.3 5.68C43.98 37.22 46.1 31.42 46.1 24.5z"
      />
      <Path
        fill="#FBBC05"
        d="M10.74 28.68A14.5 14.5 0 019.5 24c0-1.62.28-3.2.74-4.68l-8.04-6.24A23.9 23.9 0 000 24c0 3.88.94 7.56 2.7 10.56l8.04-6.24z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.4 0 11.78-2.1 15.7-5.7l-7.3-5.68c-2.02 1.36-4.6 2.16-8.4 2.16-6.22 0-11.5-4-13.26-9.68l-8.04 6.24C6.6 42.52 14.64 48 24 48z"
      />
    </Svg>
  )
}

export default Google
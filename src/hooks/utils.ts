import { useState } from 'react'

export const useToggle: (init: boolean) => [boolean, () => void] = (init) => {
  const [flag, setFlag] = useState(init)
  return [flag, () => setFlag(!flag)]
}

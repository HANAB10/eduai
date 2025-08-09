"use client"

import { useState, useTransition, useCallback } from "react"

export function useActionState<T>(
  action: (prevState: T, formData: FormData) => Promise<T>,
  initialState: T,
  permalink?: string,
): [T, (formData: FormData) => void, boolean] {
  const [state, setState] = useState<T>(initialState)
  const [isPending, startTransition] = useTransition()

  const dispatch = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        try {
          const newState = await action(state, formData)
          setState(newState)
        } catch (error) {
          console.error("Action failed:", error)
          // 可以在这里添加错误处理逻辑
        }
      })
    },
    [action, state],
  )

  return [state, dispatch, isPending]
}

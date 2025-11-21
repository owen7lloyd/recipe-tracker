import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'conditional', true && 'included')
      expect(result).toContain('base')
      expect(result).toContain('included')
      expect(result).not.toContain('conditional')
    })

    it('should handle Tailwind class conflicts', () => {
      const result = cn('p-4', 'p-8')
      // Should only include the last padding class
      expect(result).toBe('p-8')
    })

    it('should handle empty inputs', () => {
      const result = cn('', undefined, null, false)
      expect(result).toBe('')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle objects', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })
      expect(result).toContain('class1')
      expect(result).not.toContain('class2')
      expect(result).toContain('class3')
    })
  })
})

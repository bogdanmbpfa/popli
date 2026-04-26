import type { DirectiveBinding, ObjectDirective } from 'vue';

export type KeyfilterValue =
  | RegExp
  | string
  | { pattern: RegExp | string; validateOnly?: boolean };

type KeyfilterContext = {
  target: HTMLInputElement | HTMLTextAreaElement;
  pattern: RegExp;
  validateOnly: boolean;
  composing: boolean;
  keydown: EventListener;
  beforeinput: EventListener;
  paste: EventListener;
  input: EventListener;
  compositionstart: EventListener;
  compositionend: EventListener;
};

const ctxByRoot = new WeakMap<HTMLElement, KeyfilterContext>();

function parsePattern(value: unknown): RegExp | null {
  if (value == null) return null;
  if (value instanceof RegExp) return value;
  if (typeof value === 'string') {
    const slash = value.match(/^\/(.+)\/([gimsuy]*)$/);
    if (slash?.[1] != null) {
      return new RegExp(slash[1], slash[2] ?? '');
    }
    return new RegExp(value);
  }
  return null;
}

function resolveOptions(binding: DirectiveBinding<KeyfilterValue>): {
  pattern: RegExp | null;
  validateOnly: boolean;
} {
  const v = binding.value;
  let validateOnly = false;
  let patternSource: unknown = v;
  if (v && typeof v === 'object' && !(v instanceof RegExp)) {
    const o = v as { pattern?: unknown; validateOnly?: boolean };
    if ('validateOnly' in o) validateOnly = Boolean(o.validateOnly);
    if ('pattern' in o) patternSource = o.pattern;
  }
  return { pattern: parsePattern(patternSource), validateOnly };
}

function getFormControl(
  root: HTMLElement,
): HTMLInputElement | HTMLTextAreaElement | null {
  if (root instanceof HTMLInputElement) {
    const t = root.type;
    if (
      t === 'hidden' ||
      t === 'file' ||
      t === 'checkbox' ||
      t === 'radio' ||
      t === 'button' ||
      t === 'submit' ||
      t === 'reset' ||
      t === 'image'
    ) {
      return null;
    }
    return root;
  }
  if (root instanceof HTMLTextAreaElement) return root;
  const inner = root.querySelector(
    'input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]), textarea',
  );
  return inner as HTMLInputElement | HTMLTextAreaElement | null;
}

function unbind(root: HTMLElement) {
  if (!import.meta.client) return;
  const ctx = ctxByRoot.get(root);
  if (!ctx) return;
  const { target } = ctx;
  target.removeEventListener('keydown', ctx.keydown);
  target.removeEventListener('beforeinput', ctx.beforeinput);
  target.removeEventListener('paste', ctx.paste);
  target.removeEventListener('input', ctx.input);
  target.removeEventListener('compositionstart', ctx.compositionstart);
  target.removeEventListener('compositionend', ctx.compositionend);
  ctxByRoot.delete(root);
}

function bind(root: HTMLElement, binding: DirectiveBinding<KeyfilterValue>) {
  if (!import.meta.client) return;
  unbind(root);
  const { pattern, validateOnly } = resolveOptions(binding);
  if (!pattern) return;

  const target = getFormControl(root);
  if (!target) return;

  const ctx: KeyfilterContext = {
    target,
    pattern,
    validateOnly,
    composing: false,
    keydown: () => {},
    beforeinput: () => {},
    paste: () => {},
    input: () => {},
    compositionstart: () => {},
    compositionend: () => {},
  };

  ctx.keydown = (event: Event) => {
    const e = event as KeyboardEvent;
    if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Tab') return;
    if (ctx.composing || e.isComposing) return;

    const regex = ctx.pattern;
    if (!regex) return;

    const key = e.key;
    if (key.length !== 1 && key !== ' ') return;

    const t = ctx.target;
    const testKey = ctx.validateOnly
      ? `${t.value.slice(0, t.selectionStart ?? 0)}${key}${t.value.slice(
          t.selectionEnd ?? 0,
        )}`
      : key;

    if (!regex.test(testKey)) {
      e.preventDefault();
    }
  };

  ctx.beforeinput = (event: Event) => {
    const e = event as InputEvent;
    if (ctx.composing || e.isComposing) return;
    const regex = ctx.pattern;
    if (!regex) return;

    const type = e.inputType;
    if (
      type === 'deleteContentBackward' ||
      type === 'deleteContentForward' ||
      type === 'deleteByDrag' ||
      type === 'deleteByCut' ||
      type === 'historyUndo' ||
      type === 'historyRedo'
    ) {
      return;
    }

    const data = e.data;
    if (data == null || data === '') return;

    const t = ctx.target;
    const ok = ctx.validateOnly
      ? regex.test(
          `${t.value.slice(0, t.selectionStart ?? 0)}${data}${t.value.slice(
            t.selectionEnd ?? 0,
          )}`,
        )
      : [...data].every((ch) => regex.test(ch));

    if (!ok) {
      e.preventDefault();
    }
  };

  ctx.paste = (event: Event) => {
    const e = event as ClipboardEvent;
    const regex = ctx.pattern;
    if (!regex) return;

    const clipboard = e.clipboardData?.getData('text') ?? '';
    if (clipboard === '') return;

    const t = ctx.target;
    let testValue: string;
    if (ctx.validateOnly) {
      testValue = `${t.value.slice(0, t.selectionStart ?? 0)}${clipboard}${t.value.slice(t.selectionEnd ?? 0)}`;
    } else {
      testValue = clipboard;
    }

    const filtered = [...testValue].filter((ch) => regex.test(ch)).join('');
    const ok = filtered === testValue;

    if (!ok) {
      if (ctx.validateOnly) {
        const before = t.value.slice(0, t.selectionStart ?? 0);
        const after = t.value.slice(t.selectionEnd ?? 0);
        t.value = before + filtered + after;
        const newCursorPos = (before + filtered).length;
        t.setSelectionRange?.(newCursorPos, newCursorPos);
      } else {
        t.value = filtered;
        // Move caret at end
        t.setSelectionRange?.(filtered.length, filtered.length);
      }
      t.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (!ok) {
      e.preventDefault();
    }
  };

  ctx.input = (_e: Event) => {
    if (ctx.composing) return;
    const regex = ctx.pattern;
    if (!regex) return;

    const t = ctx.target;
    if (!regex.test(t.value)) {
      const filtered = [...t.value].filter((ch) => regex.test(ch)).join('');
      if (filtered !== t.value) {
        t.value = filtered;
        t.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  ctx.compositionstart = () => {
    ctx.composing = true;
  };

  ctx.compositionend = (_e: Event) => {
    ctx.composing = false;
    ctx.input(new Event('input'));
  };

  target.addEventListener('keydown', ctx.keydown);
  target.addEventListener('beforeinput', ctx.beforeinput);
  target.addEventListener('paste', ctx.paste);
  target.addEventListener('input', ctx.input);
  target.addEventListener('compositionstart', ctx.compositionstart);
  target.addEventListener('compositionend', ctx.compositionend);

  ctxByRoot.set(root, ctx);
}

function refreshPattern(
  root: HTMLElement,
  binding: DirectiveBinding<KeyfilterValue>,
) {
  const ctx = ctxByRoot.get(root);
  const { pattern, validateOnly } = resolveOptions(binding);
  if (ctx && pattern) {
    ctx.pattern = pattern;
    ctx.validateOnly = validateOnly;
  }
}

const keyfilter: ObjectDirective<HTMLElement, KeyfilterValue> = {
  getSSRProps() {
    return {};
  },
  mounted(el, binding) {
    bind(el, binding);
  },
  updated(el, binding) {
    if (!import.meta.client) return;
    const next = resolveOptions(binding);
    if (!next.pattern) {
      unbind(el);
      return;
    }
    const target = getFormControl(el);
    if (!target) {
      unbind(el);
      return;
    }
    const existing = ctxByRoot.get(el);
    if (!existing || existing.target !== target) {
      bind(el, binding);
      return;
    }
    refreshPattern(el, binding);
  },
  beforeUnmount(el) {
    unbind(el);
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('keyfilter', keyfilter);
});

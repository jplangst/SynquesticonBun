//TODO move other signals over here as well

import { signal } from '@preact/signals';
export const roleSignal = signal<string|null>("") //Extract the role from the url if it exists
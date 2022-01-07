# Patches

## Auto-complete features (Listbox)
This repository uses the `@headlessui/react` library for its list box, and modifies some parts of the code to support auto-complete features. However, this custom build is not compatible with the original one. This file will note changes about the library.


### `src/components/listbox/listbox.tsx`
- [#closeOnEnner](#closeOnEnter) Close the input box on enter.
- [#resultNavigation](#resultNavigation) Add more support on results key navigation.
- [#noOptionsFocus](#noOptionsFocus) Prevent trapped into options focus (as we implemented already).
- [#showAutoComplete](#showAutoComplete) Show autocomplete on typing.
- [#injectKeyEvents](#injectKeyEvents) Inject keyboard events if options not showing.
- [#inputChange](#inputChange) Add input onChange event for custom values.
- [#focusOnMounted](#focusOnMounted) Focus the new input on mounted


### `#closeOnEnter`
**Default behaviour:** Enter key will simply open the list and focus on the first item.

**New behaviour:** If list was closed, do nothing. Else, set the current value and close the list.

### `#resultNavigation`
**Default behaviour:** Navigation through the list was limited to previous and next item.

**New behaviour:** Add more support on key arrow navigaion. Includes navigating from first or last item in the list and navigate to the input box.

### `#noOptionsFocus`
**Default behaviour:** When the button was clicked, the list was focus automatically, cause typing not to work.

**New behaviour:** The list will not focus automatically unless the user explictly focus on it.

### `#showAutoComplete`
**Default behaviour:** When the user starts typing, the list doesn't show automatically.

**New behaviour:** The list will show automatically on typing.

### `#injectKeyEvents`
**Default behaviour:** The `@headlessui/react` handles all keyboard events internally. It cannot be injected.

**New behaviour:** Fires the custom `keyDown` event if the list doesn't open or there are no items.

### `#inputChange`
**Default behaviour:** You can only set the value by selecting on the existing items, which isn't always available in the autocomplete.

**New behaviour:** Add input `onChange` event so typing will also set its value.

#### `#focusOnMounted`
**Default behaviour:** When adding new entries, their inputs are not focused, which is different from the normal HTML input.

**New behaviour:** Buttons are automatically focus on mounted to ensure that new inputs will be focused.
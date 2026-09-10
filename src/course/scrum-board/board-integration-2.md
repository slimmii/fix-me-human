An interface is ready when its parts work together. Check a sequence of actions, because a feature can work on its own and still break after another feature changes the data.

For a library interface, a useful walkthrough would be:

1. Add a book with spaces around its name and confirm the displayed name is clean.
2. Open an editor, change the draft, cancel, and reopen it. The saved name should remain.
3. Save a new name, search for it, and then clear the search.
4. Remove one of two books with the same name. The other book should remain.
5. Check totals, empty results and long text at both wide and narrow widths.

Repeat actions on newly created items as well as the initial examples. Include blank input and removal of the last item. Watch for unrelated entries changing or local drafts jumping between items.

When behavior is wrong, follow the data: which component owns the saved value, which callback changes it, and which components read the result? Shared data needs one owner. Drafts stay local. Filtered views and counts are calculations. Effects handle external synchronization.

B.U.G.'s checks cover rendered behavior and some required source structures. Each scenario uses a fresh preview, and the preview resets after checking. Passing checks does not prove every key, callback or dependency is correct, so review the data flow too.

Keep the implementation focused on the brief. Complete the existing workflow before adding extra features.

# TODO

- meta - move these into github issues
- `list`: lists main and items
- dx options
  - running `next` without `start` - give a hint and option to run `start`
  - replace `start`/`next` with "new" with meaning inference
  - `new` will always create a new branch based on the branch at the top of the stack
- `up`/`down` command options - rebases up or merges
  - all branches
  - just adjacent
- convert PR title into template and not hard coded
- When collapsing, each pr should have a single squashed commit in the commit log.
  Main->a->b
  Squash a in place, squash b onto a, merge a onto main, merge main onto master
- interface to drag and drop commits between stack items

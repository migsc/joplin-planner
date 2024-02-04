// By default, 100 items are returned in a single page
// https://joplinapp.org/help/api/references/rest_api/#pagination
export type Page<I> = {
    has_more: boolean;
    items: I[]
}
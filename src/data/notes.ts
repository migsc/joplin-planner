import joplin from 'api'
import { Page } from './types'

export async function create(body: CreateParams): Promise<Note> {
    console.debug(`joplin.data.post:/notes`, body)
    return joplin.data.post(['notes'], null, body);
}

export async function get(id: string): Promise<Note> {
    console.debug(`joplin.data.get:/notes/${id}`, { fields })
    return joplin.data.get(['notes', id], { fields });
}

export async function getAll(folderID?: string): Promise<Page<Note>> {
    console.debug(`joplin.data.get:/folders/${folderID}/notes`, { fields })
    if (folderID) return joplin.data.get(['folders', folderID, 'notes'], { fields });

    return joplin.data.get(['notes'], { fields });
}

export async function update(id: string, body: Partial<Note>): Promise<void> {
    console.debug(`joplin.data.update:/notes/${id}`, { body, })
    await joplin.data.put(['notes', id], null, body);
}

export async function _delete(id: string): Promise<void> {
    console.debug(`joplin.data.delete:/notes/${id}`)
    await joplin.data.delete(['notes', id]);
}

const fields = 'id,parent_id,title,body,order,created_time,updated_time'

export type CreateParams = Pick<Note, 'title' | 'body' | 'parent_id'>

export type Note = {
    parent_id: string
    id: string;
    title: string;
    body: string;
    created_time: number;
    updated_time: number;
}

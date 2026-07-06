import { auth } from '@/lib/auth'
import { getEntryById, deleteEntry } from '@/lib/entries'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entry = await getEntryById(params.id)
  if (!entry || entry.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // delete from cloudinary if it's a file entry
  if (entry.type === 'file' && entry.filePublicId) {
    await deleteFromCloudinary(entry.filePublicId)
  }

  // delete from redis
  await deleteEntry(params.id)

  return NextResponse.json({ ok: true })
}

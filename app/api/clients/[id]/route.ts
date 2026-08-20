import { NextRequest, NextResponse } from 'next/server';
import { ClientService } from '@/services/client.service';
import { clientSchema } from '@/lib/validations/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await ClientService.getClientById(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ client });
  } catch (error: unknown) {
    console.error('Error fetching client by ID:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve client' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = clientSchema.partial().parse(body);

    const updated = await ClientService.updateClient(id, validatedData);
    if (!updated) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ client: updated, success: true });
  } catch (error: unknown) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await ClientService.deleteClient(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: unknown) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}

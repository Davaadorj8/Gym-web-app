import { NextRequest, NextResponse } from 'next/server';
import { ClientService, clientSchema } from '@/modules/clients/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    const clients = await ClientService.getAllClients(search, status);
    return NextResponse.json({ clients, data: clients, count: clients.length, success: true });
  } catch (error: unknown) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve client records' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = clientSchema.parse(body);

    const newClient = await ClientService.createClient(validatedData);
    return NextResponse.json({ client: newClient, data: newClient, success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating client:', error);
    if (error && typeof error === 'object' && 'errors' in error) {
      const issues = (error as any).errors;
      const firstMsg = Array.isArray(issues) && issues[0]?.message ? issues[0].message : 'Invalid client form data';
      return NextResponse.json(
        { error: `Validation failed: ${firstMsg}`, details: issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create client' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    await ClientService.deleteClient(id);
    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete client' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { ClientService } from '@/services/client.service';
import { clientSchema } from '@/lib/validations/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    const clients = await ClientService.getAllClients(search, status);
    return NextResponse.json({ clients, count: clients.length });
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
    return NextResponse.json({ client: newClient, success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating client:', error);
    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

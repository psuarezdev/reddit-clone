import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req:NextRequest) {
  try {
    const url = new URL(req.nextUrl);
    const href = url.searchParams.get('url');

    if(!href) {
      return NextResponse.json(
        { message: 'Invalid URL' },
        { status: 400 }
      );
    }

    const res = await fetch(href);
    const data = await res.text();

    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'No title found';

    const descriptionMatch = data.match(/<meta name="description" content="(.*?)">/);
    const description = descriptionMatch ? descriptionMatch[1] : 'No description found';

    const imageMatch = data.match(/<meta property="og:image" content="(.*?)">/);
    const imageUrl = imageMatch ? imageMatch[1] : 'No image found';

    return NextResponse.json({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: imageUrl
        }
      }
    });
  } catch (err) {
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
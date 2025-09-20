import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { adminDb } from "@/app/_lib/admin";
import { YouTubeVideo } from "@/app/_types/types";
import { getDeepseekResponse } from "@/app/_lib/aiActions";
import { Timestamp } from "firebase-admin/firestore";

// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // Currently unused

// Currently unused - for future implementation with actual YouTube API
// async function getYouTubeSubscriptions(accessToken: string): Promise<string[]> {
//   try {
//     const response = await fetch(
//       `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50&key=${YOUTUBE_API_KEY}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`YouTube API error: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.items?.map((item: any) => item.snippet.resourceId.channelId) || [];
//   } catch (error) {
//     console.error("Error fetching YouTube subscriptions:", error);
//     return [];
//   }
// }

// Currently unused - for future implementation with actual YouTube API
// async function getLatestVideosFromChannels(channelIds: string[]): Promise<YouTubeVideo[]> {
//   if (!YOUTUBE_API_KEY || channelIds.length === 0) {
//     return [];
//   }

//   try {
//     // Get latest videos from the last 24 hours
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     const publishedAfter = yesterday.toISOString();

//     const allVideos: YouTubeVideo[] = [];
    
//     // Process channels in batches to avoid API limits
//     const batchSize = 5;
//     for (let i = 0; i < channelIds.length; i += batchSize) {
//       const batch = channelIds.slice(i, i + batchSize);
      
//       for (const channelId of batch) {
//         try {
//           const response = await fetch(
//             `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&publishedAfter=${publishedAfter}&type=video&order=date&maxResults=3&key=${YOUTUBE_API_KEY}`
//           );

//           if (response.ok) {
//             const data = await response.json();
//             const videos = data.items?.map((item: any) => ({
//               id: item.id.videoId,
//               title: item.snippet.title,
//               channelTitle: item.snippet.channelTitle,
//               channelId: item.snippet.channelId,
//               description: item.snippet.description,
//               publishedAt: new Date(item.snippet.publishedAt),
//               thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
//             })) || [];
            
//             allVideos.push(...videos);
//           }
//         } catch (error) {
//           console.error(`Error fetching videos for channel ${channelId}:`, error);
//         }
//       }
//     }

//     // Sort by publish date (newest first) and limit to top 10
//     return allVideos
//       .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
//       .slice(0, 10);
//   } catch (error) {
//     console.error("Error fetching latest videos:", error);
//     return [];
//   }
// }

async function generateVideoSummary(videos: YouTubeVideo[]): Promise<string> {
  if (videos.length === 0) {
    return "No new videos found from your subscriptions in the last 24 hours.";
  }

  const videoList = videos.map((video, index) => 
    `${index + 1}. "${video.title}" by ${video.channelTitle}\n   Description: ${video.description.slice(0, 200)}...`
  ).join('\n\n');

  const prompt = `You are a helpful assistant that summarizes YouTube videos for busy users. Here are the latest videos from the user's subscriptions:

${videoList}

Please provide a concise, engaging summary that:
1. Highlights the most interesting or important videos
2. Groups similar content together when possible
3. Mentions which creators posted what
4. Keeps it under 300 words
5. Uses a friendly, conversational tone

Focus on helping the user decide which videos are worth their time.`;

  try {
    const result = await getDeepseekResponse([
      { role: "user", content: prompt }
    ]);

    if (result.error) {
      return "Unable to generate summary at this time. Please check the videos manually.";
    }

    return result.response?.content || "Summary could not be generated.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary at this time. Please check the videos manually.";
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // For now, we'll create a mock implementation since we don't have YouTube API access
    // TODO: Implement proper Google OAuth with YouTube scope for production

    // Check if we already processed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingSummary = await adminDb
      .collection("youtubeSummaries")
      .where("userId", "==", userId)
      .where("createdAt", ">=", Timestamp.fromDate(today))
      .limit(1)
      .get();

    if (!existingSummary.empty) {
      return NextResponse.json({ 
        message: "YouTube summary already generated today",
        summary: existingSummary.docs[0].data()
      });
    }

    // For demo purposes, create mock video data
    // In production, this would use actual YouTube API calls
    const videos: YouTubeVideo[] = [
      {
        id: "dQw4w9WgXcQ",
        title: "Daily Productivity Tips for 2025",
        channelTitle: "Productivity Pro",
        channelId: "UC_mock_channel_1",
        description: "Learn the top 10 productivity tips that will transform your daily routine and help you achieve more in less time.",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
      },
      {
        id: "mock_video_2",
        title: "Next.js 15 New Features Explained",
        channelTitle: "Web Dev Mastery",
        channelId: "UC_mock_channel_2",
        description: "Comprehensive overview of all the new features in Next.js 15, including Server Components improvements and new caching strategies.",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        thumbnailUrl: "https://img.youtube.com/vi/mock_video_2/mqdefault.jpg"
      },
      {
        id: "mock_video_3",
        title: "Healthy Morning Routine for Better Focus",
        channelTitle: "Wellness Journey",
        channelId: "UC_mock_channel_3",
        description: "Start your day right with this science-backed morning routine that improves focus, energy, and overall well-being.",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        thumbnailUrl: "https://img.youtube.com/vi/mock_video_3/mqdefault.jpg"
      }
    ];
    
    // Generate AI summary
    const summary = await generateVideoSummary(videos);

    // Save to database
    const summaryDoc = {
      userId,
      videos: videos.map(video => ({
        ...video,
        publishedAt: Timestamp.fromDate(video.publishedAt)
      })),
      summary,
      createdAt: Timestamp.fromDate(new Date()),
      processedAt: Timestamp.fromDate(new Date())
    };

    const docRef = await adminDb.collection("youtubeSummaries").add(summaryDoc);

    return NextResponse.json({
      success: true,
      summaryId: docRef.id,
      summary,
      videoCount: videos.length
    });

  } catch (error) {
    console.error("Error in YouTube summarize route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
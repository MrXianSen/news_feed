import json
import logging
logger = logging.getLogger(__name__)

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.generic.base import View

from news_feed.subreddit.models import Subreddit

from .models import Post, Comment


class CreatePostView(View):

    """
    This view creates a Post object in a given Subreddit.

    Input: a keyword parameter subreddit ID, or the special term 'global' to signify no Subreddit
    input_data, a json string representing a dictionary containing 'title' and 'content' keys.

    Output: 200 on success, 400 on missing parameter, 404 on invalid subreddit ID
    """

    def post(self, request, subreddit_scope, *args, **kwargs):
        input_data = json.loads(request.body)

        if 'title' not in input_data or 'content' not in input_data:
            logger.error('Missing parameter')
            return JsonResponse(status=400, data={'status': 'Missing parameter'}, safe=False)
        subreddit = None
        if subreddit_scope != 'global':
            subreddit = get_object_or_404(Subreddit, id=subreddit_scope)
        # STUDENT TODO | Create post from parameters
        # DONE
        title = input_data['title']
        content = input_data['content']
        popularity = input_data['popularity']
        subreddit.popularity = popularity + 1;
        print subreddit.popularity
        post = Post(title=title, content=content, subreddit=subreddit)
        subreddit.save();
        post.save()
        return JsonResponse(status=200, data={'status': 'OK'}, safe=False)


class ListPostView(View):

    """
    This view lists all Posts for a given Subreddit.

    Input: a keyword parameter subreddit ID, or the special term 'global' to signify all posts
    Output: 200 on success and a list of dictionaries, each one containing 'id', 'created',
    'title', and 'content'
    """

    def get(self, request, subreddit_scope, *args, **kwargs):
        if subreddit_scope == 'global':
            posts = Post.objects.all().order_by('-num_likes')#.exclude(title__iexact='bad').exclude(num_likes__gt=10)
        else:
            posts = Post.objects.filter(subreddit__id=subreddit_scope).exclude(title__iexact='bad').exclude(num_likes__gt=10).order_by('-num_likes')
        # DONE
        return JsonResponse(
            status=200,
            data={
                'status': 'OK',
                # STUDENT TODO | Return title and content as well
                'posts': [
                    {
                        'id': post.id,
                        'created': post.created,
                        'title': post.title,
                        'content': post.content,
                        'num_likes': post.num_likes,
                    } for post in posts
                ]
            }
        )

# DONE
class LikePostView(View):
    def post(self, request, subreddit_scope, *args, **kwargs):
        print '-------------------------------'
        print subreddit_scope
        print '-------------------------------'
        input_data = json.loads(request.body)
        if 'id' not in input_data:
            logger.error('Missing parameter')
            return JsonResponse(status=400, data={'status': 'Missing parameter'}, safe=False)
        id = input_data['id']
        post = Post.objects.get(id=id)
        post.num_likes = post.num_likes + 1
        post.save()
        return JsonResponse(status=200, data={'status': 'OK'}, safe=False)

class CreateCommentView(View):
    def post(self, request, subreddit_scope, *args, **kwargs):
        input_data = json.loads(request.body)
        print input_data
        if 'content' not in input_data and 'id' not in input_data:
            return JsonResponse(status=400, data={'status': 'Missing parameter'}, safe=False)
        content = input_data['content']
        print '---------------------------------'
        print content
        print '---------------------------------'
        id = input_data['id']
        post = Post.objects.get(id=id)
        comment = Comment(content=content, post=post)
        comment.save()
        return JsonResponse(status=200, data={'status':'OK'}, safe=False)

class GetCommentView(View):
    def post(self, request, subreddit_scope, *args, **kwargs):
        input_data = json.loads(request.body)
        if 'id' not in input_data:
            return JsonResponse(status=400, data={'status': 'Missing parameter'}, safe=False)
        id = input_data['id']
        comments = Comment.objects.filter(post__id=id)
        print comments
        return JsonResponse(
            status=200,
            data={
                'status': 'OK',
                # STUDENT TODO | Return title and content as well
                'comments': [
                    {
                        'content': comment.content,
                    } for comment in comments
                ]
            }
        )
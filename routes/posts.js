const express = require("express");

const dateFormat = require("../utills/date.js");
const { Post, Comment, Like } = require("../models");
const auth_middleware = require("../middlewares/auth-middleware.js");
const e = require("express");

const router = express.Router();

// 게시글 리스트
router.get("/posts", async (req, res) => {
    const data = await Post.findAll({
        attributes: ["id", "title", "date", "likes"],
        order: [["date", "DESC"]]
    })

    res.status(200).json({ data });
});

// 게시글 작성
router.post("/posts", auth_middleware, async (req, res) => {
    try {
        const { title, content } = req.body;
        const user_id = req.decoded.user_id;

        if (!title || !content || !user_id) {
            throw error;
        }

        await Post.create({ title, content, date: dateFormat(new Date()), user_id });

        res.status(201).json({
            msg: "게시글을 작성했습니다."
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "데이터 형식이 올바르지 않습니다."
        });
    }
});

// 좋아요 게시글 보기
router.get("/posts/likes", auth_middleware, async (req, res) => {
    try {
        const user_id = req.decoded.user_id;


        const data = await Post.findAll({
            attributes: ["id", "title", "content", "date", "likes"],
            include: [{
                model: Like,
                attributes: [],
                where: { done: 1, user_id: user_id }
            }]
        });

        res.status(200).json({ data });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "좋아요 게시글 조회에 실패하였습니다."
        });
    }
});

// 게시글 조회
router.get("/posts/:post_id", async (req, res) => {
    const { post_id } = req.params;

    const data = await Post.findOne({
        attributes: ["id", "title", "content", "date", "likes"],
        where: { id: post_id }
    });

    if (!data) {
        return res.status(404).json({
            msg: "게시글 조회에 실패하였습니다."
        });
    }

    res.status(200).json({ data });
});

// 게시글 수정
router.put("/posts/:post_id", auth_middleware, async (req, res) => {
    try {
        const { post_id } = req.params;
        const { title, content } = req.body;
        const user_id = req.decoded.user_id;

        if (!title || !content) {
            return res.status(400).json({
                msg: "데이터 형식이 올바르지 않습니다."
            });
        }

        if (title === "") {
            return res.status(412).json({
                msg: "게시글 제목의 형식이 일치하지 않습니다."
            });
        }

        if (content === "") {
            return res.status(412).json({
                msg: "게시글 내용의 형식이 일치하지 않습니다."
            });
        }

        const post = await Post.findOne({
            where: { id: post_id },
            attributes: ["id", "user_id"]
        })

        if (!post) {
            return res.status(404).json({
                msg: "게시글이 존재하지 않습니다."
            });
        }

        console.log(post)
        if (post.user_id !== user_id) {
            return res.status(403).json({
                msg: "게시글의 작성자가 아닙니다."
            });
        }

        await Post.update({
            title,
            content,
            date: dateFormat(new Date())
        }, {
            where: { id: post_id }
        });

        res.status(200).json({
            msg: "게시글을 수정했습니다."
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "게시글 수정에 실패하였습니다."
        });
    }
});

// 게시글 삭제
router.delete("/posts/:post_id", auth_middleware, async (req, res) => {
    try {
        const { post_id } = req.params;
        const user_id = req.decoded.user_id;

        const post = await Post.findOne({
            where: { id: post_id },
            attributes: ["id", "user_id"]
        })

        if (!post) {
            return res.status(404).json({
                msg: "게시글이 존재하지 않습니다."
            });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({
                msg: "게시글의 작성자가 아닙니다."
            });
        }

        await Post.destroy({
            where: { id: post_id }
        });

        res.status(200).json({
            msg: "게시글을 삭제했습니다."
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "게시글 삭제에 실패하였습니다."
        });
    }
});

// 댓글 작성
router.post("/posts/:post_id/comments", auth_middleware, async (req, res) => {
    try {
        const { comment } = req.body;
        const { post_id } = req.params;
        const user_id = req.decoded.user_id;

        if (!comment || comment === "") {
            return res.status(412).json({
                msg: "댓글 형식이 올바르지 않습니다."
            });
        }

        const post = await Post.findOne({
            where: { id: post_id },
            attributes: ["id"]
        })

        if (!post) {
            return res.status(404).json({
                msg: "게시글이 존재하지 않습니다."
            });
        }

        await Comment.create({ comment, date: dateFormat(new Date()), user_id, post_id });

        res.status(201).json({
            msg: "댓글을 작성했습니다."
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "데이터 형식이 올바르지 않습니다."
        });
    }
});

// 게시글 댓글 모두 조회
router.get("/posts/:post_id/comments", async (req, res) => {
    try {
        const { post_id } = req.params;

        const post = Post.findOne({
            where: { id: post_id }
        })

        if (!post) {
            return res.status(404).json({
                msg: "게시글이 존재하지 않습니다."
            });
        }

        const data = await Post.findOne({
            where: { id: post_id },
            attributes: ["id", "title", "content", "date", "likes"],
            include: [{
                model: Comment,
                attributes: ["id", "comment", "date"],
                separate: true,
                order: [["date", "DESC"]]
            }]
        });

        res.status(200).json({ data });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "댓글 조회에 실패하였습니다."
        });
    }
});
  
// 댓글 수정
router.put("/posts/:post_id/comments/:comment_id", auth_middleware, async (req, res) => {
    try {
        const { post_id, comment_id } = req.params;
        const { comment } = req.body;
        const user_id = req.decoded.user_id;

        if (!comment || comment === "") {
            return res.status(412).json({
                msg: "댓글 형식이 올바르지 않습니다."
            });
        }

        const post = await Post.findOne({
            where: { id: post_id }
        })

        if (!post) {
            return res.status(404).json({
                msg: "게시글이 존재하지 않습니다."
            });
        }

        const check_comment = await Comment.findOne({
            where: { id: comment_id },
            attributes: ["id", "user_id"]
        })

        if (!check_comment) {
            return res.status(404).json({
                msg: "댓글이 존재하지 않습니다."
            });
        }

        if (check_comment.user_id !== user_id) {
            return res.status(403).json({
                msg: "댓글의 작성자가 아닙니다."
            });
        }

        await Comment.update({
            comment
        }, {
            where: { id: comment_id }
        });

        res.status(200).json({
            msg: "댓글을 수정했습니다."
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "댓글 수정에 실패하였습니다."
        });
    }
});

// 댓글 삭제
router.delete("/posts/:post_id/comments/:comment_id", auth_middleware, async (req, res) => {
    try {
        const { post_id, comment_id } = req.params;
        const user_id = req.decoded.user_id;

        const post = await Post.findOne({
            where: { id: post_id }
        })

        if (!post) {
            return res.status(404).json({
                msg: "게시글이 존재하지 않습니다."
            });
        }

        const check_comment = await Comment.findOne({
            where: { id: comment_id },
            attributes: ["id", "user_id"]
        })

        if (!check_comment) {
            return res.status(404).json({
                msg: "댓글이 존재하지 않습니다."
            });
        }

        if (check_comment.user_id !== user_id) {
            return res.status(403).json({
                msg: "댓글의 작성자가 아닙니다."
            });
        }

        await Comment.destroy({
            where: { id: comment_id }
        });

        res.status(200).json({
            msg: "댓글을 삭제했습니다."
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "댓글 삭제에 실패하였습니다."
        });
    }
});

// 게시글 좋아요
router.post("/posts/:post_id/likes", auth_middleware, async (req, res) => {
    try {
        const { post_id } = req.params;
        const user_id = req.decoded.user_id;

        const post = await Post.findOne({
            where: { id: post_id }
        })

        if (!post) {
            return res.status(404).json({
                msg: "게시글이 존재하지 않습니다."
            });
        }

        const likes = await Post.findOne({
            where: { id: post_id },
            attributes: ["likes"]
        });

        const check_like = await Like.findOne({
            where: {
                post_id: post_id,
                user_id: user_id
            }
        })

        // 최초의 좋아요 때문에 필요함
        if (check_like === null) {
            Like.create({ done: 1, post_id, user_id });
            Post.update({
                likes: likes.likes + 1
            }, {
                where: { id: post_id }
            });
            return res.status(201).json({
                msg: "좋아요를 눌렀습니다."
            });
        }

        if (check_like.done === 0) {
            Like.update(
                {
                    done: 1
                }, {
                where: {
                    post_id: post_id,
                    user_id: user_id
                }
            });
            Post.update({
                likes: likes.likes + 1
            }, {
                where: { id: post_id }
            });
            return res.status(200).json({
                msg: "좋아요를 눌렀습니다."
            });
        } else {
            Like.update(
                {
                    done: 0
                }, {
                where: {
                    post_id: post_id,
                    user_id: user_id
                }
            });
            Post.update({
                likes: likes.likes - 1
            }, {
                where: { id: post_id }
            });
            return res.status(200).json({
                msg: "좋아요를 취소했습니다."
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            msg: "게시글 좋아요에 실패하였습니다."
        });
    }
});

module.exports = router;
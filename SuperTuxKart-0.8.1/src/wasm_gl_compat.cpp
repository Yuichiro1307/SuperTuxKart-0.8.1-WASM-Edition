#include <GL/gl.h>
#include <emscripten.h>

extern "C" {

EM_JS(void, setColorMaterialMode, (GLenum mode), {
    Module.stkColorMaterialMode = mode;
});

void glColorMaterial(GLenum, GLenum mode)
{
    setColorMaterialMode(mode);
}

void glLightModeli(GLenum, GLint)
{
}

void glLightf(GLenum, GLenum, GLfloat)
{
}

void glHint(GLenum, GLenum)
{
}

void glMaterialf(GLenum face, GLenum pname, GLfloat value)
{
    glMaterialfv(face, pname, &value);
}

void glPushAttrib(GLbitfield)
{
}

void glPopAttrib()
{
}

void glRectf(GLfloat x1, GLfloat y1, GLfloat x2, GLfloat y2)
{
    glBegin(GL_QUADS);
    glVertex2f(x1, y1);
    glVertex2f(x2, y1);
    glVertex2f(x2, y2);
    glVertex2f(x1, y2);
    glEnd();
}

void glVertex3d(GLdouble x, GLdouble y, GLdouble z)
{
    glVertex3f(static_cast<GLfloat>(x), static_cast<GLfloat>(y),
               static_cast<GLfloat>(z));
}

}

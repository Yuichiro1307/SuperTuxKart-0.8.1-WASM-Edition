//  SuperTuxKart - a fun racing game with go-kart
//  Copyright (C) 2013-2026
//
//  This program is free software; you can redistribute it and/or
//  modify it under the terms of the GNU General Public License
//  as published by the Free Software Foundation; either version 3
//  of the License, or (at your option) any later version.

#include "addons/emscripten_network_http.hpp"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <algorithm>
#include <cctype>
#include <climits>
#include <stdint.h>
#include <string>
#include <vector>

#include "addons/addons_manager.hpp"
#include "addons/news_manager.hpp"
#include "addons/request.hpp"
#include "config/stk_config.hpp"
#include "config/user_config.hpp"
#include "io/file_manager.hpp"
#include "io/xml_node.hpp"
#include "utils/string_utils.hpp"

namespace
{
struct AddonCategory
{
    const char *api_path;
    const char *pages_path;
    const char *addon_type;
};

const AddonCategory categories[] =
{
    { "Kart",   "Kart",   "kart"   },
    { "cource", "cource", "track"  },
    { "Arena",  "Arena",  "arena"  }
};

struct ZipEntry
{
    std::string name;
    std::string size;
    std::string type;
};

void skipWhitespace(const std::string &json, size_t *position)
{
    while (*position < json.size() &&
           (json[*position] == ' ' || json[*position] == '\t' ||
            json[*position] == '\r' || json[*position] == '\n'))
        ++*position;
}

void appendUtf8(std::string *out, unsigned int codepoint)
{
    if (codepoint <= 0x7f)
        out->push_back((char)codepoint);
    else if (codepoint <= 0x7ff)
    {
        out->push_back((char)(0xc0 | (codepoint >> 6)));
        out->push_back((char)(0x80 | (codepoint & 0x3f)));
    }
    else if (codepoint <= 0xffff)
    {
        out->push_back((char)(0xe0 | (codepoint >> 12)));
        out->push_back((char)(0x80 | ((codepoint >> 6) & 0x3f)));
        out->push_back((char)(0x80 | (codepoint & 0x3f)));
    }
    else
    {
        out->push_back((char)(0xf0 | (codepoint >> 18)));
        out->push_back((char)(0x80 | ((codepoint >> 12) & 0x3f)));
        out->push_back((char)(0x80 | ((codepoint >> 6) & 0x3f)));
        out->push_back((char)(0x80 | (codepoint & 0x3f)));
    }
}

int hexDigit(char c)
{
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

bool readJsonString(const std::string &json, size_t *position,
                    std::string *value)
{
    if (*position >= json.size() || json[(*position)++] != '"')
        return false;

    value->clear();
    while (*position < json.size())
    {
        char c = json[(*position)++];
        if (c == '"')
            return true;
        if ((unsigned char)c < 0x20)
            return false;
        if (c != '\\')
        {
            value->push_back(c);
            continue;
        }
        if (*position >= json.size())
            return false;

        c = json[(*position)++];
        switch (c)
        {
        case '"': value->push_back('"'); break;
        case '\\': value->push_back('\\'); break;
        case '/': value->push_back('/'); break;
        case 'b': value->push_back('\b'); break;
        case 'f': value->push_back('\f'); break;
        case 'n': value->push_back('\n'); break;
        case 'r': value->push_back('\r'); break;
        case 't': value->push_back('\t'); break;
        case 'u':
        {
            if (*position + 4 > json.size())
                return false;
            unsigned int codepoint = 0;
            for (int i = 0; i < 4; i++)
            {
                int digit = hexDigit(json[(*position)++]);
                if (digit < 0)
                    return false;
                codepoint = (codepoint << 4) | digit;
            }
            if (codepoint >= 0xd800 && codepoint <= 0xdbff)
            {
                if (*position + 6 > json.size() ||
                    json[*position] != '\\' || json[*position + 1] != 'u')
                    return false;
                *position += 2;
                unsigned int low = 0;
                for (int i = 0; i < 4; i++)
                {
                    int digit = hexDigit(json[(*position)++]);
                    if (digit < 0)
                        return false;
                    low = (low << 4) | digit;
                }
                if (low < 0xdc00 || low > 0xdfff)
                    return false;
                codepoint = 0x10000 + ((codepoint - 0xd800) << 10)
                          + (low - 0xdc00);
            }
            else if (codepoint >= 0xdc00 && codepoint <= 0xdfff)
                return false;
            appendUtf8(value, codepoint);
            break;
        }
        default:
            return false;
        }
    }
    return false;
}

bool skipJsonValue(const std::string &json, size_t *position)
{
    skipWhitespace(json, position);
    if (*position >= json.size())
        return false;

    if (json[*position] == '"')
    {
        std::string ignored;
        return readJsonString(json, position, &ignored);
    }
    if (json[*position] == '{' || json[*position] == '[')
    {
        const char close = json[(*position)++] == '{' ? '}' : ']';
        skipWhitespace(json, position);
        if (*position < json.size() && json[*position] == close)
        {
            ++*position;
            return true;
        }
        while (*position < json.size())
        {
            if (close == '}' )
            {
                std::string key;
                if (!readJsonString(json, position, &key))
                    return false;
                skipWhitespace(json, position);
                if (*position >= json.size() || json[(*position)++] != ':')
                    return false;
            }
            if (!skipJsonValue(json, position))
                return false;
            skipWhitespace(json, position);
            if (*position >= json.size())
                return false;
            char separator = json[(*position)++];
            if (separator == close)
                return true;
            if (separator != ',')
                return false;
            skipWhitespace(json, position);
        }
        return false;
    }

    size_t start = *position;
    while (*position < json.size() &&
           json[*position] != ',' && json[*position] != ']' &&
           json[*position] != '}' && json[*position] != ' ' &&
           json[*position] != '\t' && json[*position] != '\r' &&
           json[*position] != '\n')
        ++*position;
    return *position > start;
}

bool readJsonScalar(const std::string &json, size_t *position,
                    std::string *value)
{
    skipWhitespace(json, position);
    if (*position < json.size() && json[*position] == '"')
        return readJsonString(json, position, value);

    size_t start = *position;
    if (!skipJsonValue(json, position))
        return false;
    value->assign(json, start, *position - start);
    return true;
}

bool parseZipObject(const std::string &json, size_t *position,
                    ZipEntry *entry)
{
    if (*position >= json.size() || json[(*position)++] != '{')
        return false;
    skipWhitespace(json, position);
    while (*position < json.size() && json[*position] != '}')
    {
        std::string key, value;
        if (!readJsonString(json, position, &key))
            return false;
        skipWhitespace(json, position);
        if (*position >= json.size() || json[(*position)++] != ':')
            return false;
        if (key == "name" || key == "type" || key == "size")
        {
            if (!readJsonScalar(json, position, &value))
                return false;
            if (key == "name") entry->name = value;
            else if (key == "type") entry->type = value;
            else entry->size = value;
        }
        else if (!skipJsonValue(json, position))
            return false;

        skipWhitespace(json, position);
        if (*position < json.size() && json[*position] == ',')
        {
            ++*position;
            skipWhitespace(json, position);
        }
        else
            break;
    }
    if (*position >= json.size() || json[(*position)++] != '}')
        return false;
    return true;
}

bool isZipFile(const std::string &name)
{
    if (name.size() < 4)
        return false;
    std::string extension = name.substr(name.size() - 4);
    std::transform(extension.begin(), extension.end(), extension.begin(),
                   [](unsigned char c) { return (char)std::tolower(c); });
    return extension == ".zip";
}

bool parseContentsResponse(const std::string &json,
                           std::vector<ZipEntry> *entries)
{
    size_t position = 0;
    skipWhitespace(json, &position);
    if (position >= json.size() || json[position++] != '[')
        return false;

    skipWhitespace(json, &position);
    while (position < json.size() && json[position] != ']')
    {
        ZipEntry entry;
        if (!parseZipObject(json, &position, &entry))
            return false;
        if (entry.type == "file" && isZipFile(entry.name))
            entries->push_back(entry);
        skipWhitespace(json, &position);
        if (position < json.size() && json[position] == ',')
        {
            ++position;
            skipWhitespace(json, &position);
        }
        else
            break;
    }
    if (position >= json.size() || json[position++] != ']')
        return false;
    skipWhitespace(json, &position);
    return position == json.size();
}

std::string xmlEscape(const std::string &value)
{
    std::string result;
    for (size_t i = 0; i < value.size(); i++)
    {
        switch (value[i])
        {
        case '&': result += "&amp;"; break;
        case '<': result += "&lt;"; break;
        case '>': result += "&gt;"; break;
        case '"': result += "&quot;"; break;
        case '\'': result += "&apos;"; break;
        default: result += value[i]; break;
        }
    }
    return result;
}

std::string encodePathSegment(const std::string &value)
{
    static const char hex[] = "0123456789ABCDEF";
    std::string result;
    for (size_t i = 0; i < value.size(); i++)
    {
        unsigned char c = (unsigned char)value[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') || c == '-' || c == '_' ||
            c == '.' || c == '~')
            result.push_back((char)c);
        else
        {
            result.push_back('%');
            result.push_back(hex[c >> 4]);
            result.push_back(hex[c & 0x0f]);
        }
    }
    return result;
}

std::string addonIdFromFilename(const std::string &filename)
{
    std::string id = filename.substr(0, filename.size() - 4);
    std::string result;
    bool underscore = false;
    for (size_t i = 0; i < id.size(); i++)
    {
        unsigned char c = (unsigned char)id[i];
        if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
            (c >= '0' && c <= '9'))
        {
            result.push_back((char)std::tolower(c));
            underscore = false;
        }
        else if (!underscore && !result.empty())
        {
            result.push_back('_');
            underscore = true;
        }
    }
    while (!result.empty() && result[result.size() - 1] == '_')
        result.erase(result.size() - 1);
    return result;
}

std::string displayNameFromFilename(const std::string &filename)
{
    std::string name = filename.substr(0, filename.size() - 4);
    for (size_t i = 0; i < name.size(); i++)
        if (name[i] == '_' || name[i] == '-')
            name[i] = ' ';
    return name;
}

void appendAddonXml(const AddonCategory &category, const ZipEntry &entry,
                    std::string *xml)
{
    std::string id = addonIdFromFilename(entry.name);
    if (id.empty())
        return;

    char *end = NULL;
    long long size_value = strtoll(entry.size.c_str(), &end, 10);
    if (end == entry.size.c_str() || size_value < 0)
        size_value = 0;
    if (size_value > INT_MAX)
        size_value = INT_MAX;

    int format = category.addon_type[0] == 'k'
               ? stk_config->m_max_kart_version
               : stk_config->m_max_track_version;
    std::string pages_url = "https://yuichiro1307.github.io/Addon-Server/";
    pages_url += category.pages_path;
    pages_url += "/";
    pages_url += encodePathSegment(entry.name);

    *xml += "  <";
    *xml += category.addon_type;
    *xml += " name=\"" + xmlEscape(displayNameFromFilename(entry.name));
    *xml += "\" id=\"" + xmlEscape(id);
    *xml += "\" designer=\"Addon Server\" status=\"1\" date=\"0\"";
    *xml += " revision=\"1\" size=\"" + std::to_string((int)size_value);
    *xml += "\" format=\"" + std::to_string(format);
    *xml += "\" testing=\"1\" file=\"" + xmlEscape(pages_url);
    *xml += "\"/>\n";
}

}

struct EmscriptenNetworkHttp::ListingContext
{
    EmscriptenNetworkHttp *owner;
    emscripten_fetch_t *fetch;
    int category;
};

struct EmscriptenNetworkHttp::DownloadContext
{
    EmscriptenNetworkHttp *owner;
    emscripten_fetch_t *fetch;
    Request *request;
};

struct EmscriptenNetworkHttp::NewsContext
{
    EmscriptenNetworkHttp *owner;
    emscripten_fetch_t *fetch;
};

EmscriptenNetworkHttp::EmscriptenNetworkHttp()
              : m_news_context(NULL), m_listing_pending(0),
                m_listing_succeeded(0), m_started(false)
{
}

EmscriptenNetworkHttp::~EmscriptenNetworkHttp()
{
    stopNetworkThread();
}

void EmscriptenNetworkHttp::startNetworkThread()
{
    if (UserConfigParams::m_internet_status != IPERM_ALLOWED)
        return;
    startListing();
}

void EmscriptenNetworkHttp::stopNetworkThread()
{
    m_started = false;
    if (m_news_context)
    {
        NewsContext *context = m_news_context;
        m_news_context = NULL;
        if (context->fetch)
        {
            context->fetch->userData = NULL;
            emscripten_fetch_close(context->fetch);
        }
        delete context;
    }
    while (!m_listing_contexts.empty())
    {
        ListingContext *context = m_listing_contexts.back();
        m_listing_contexts.pop_back();
        emscripten_fetch_t *fetch = context->fetch;
        if (fetch)
        {
            fetch->userData = NULL;
            emscripten_fetch_close(fetch);
        }
        delete context;
    }
    m_listing_pending = 0;
    cancelAllDownloads();
}

void EmscriptenNetworkHttp::insertReInit()
{
    if (UserConfigParams::m_internet_status == IPERM_ALLOWED)
        startListing();
}

void EmscriptenNetworkHttp::startListing()
{
    stopNetworkThread();
    if (UserConfigParams::m_internet_status != IPERM_ALLOWED)
        return;

    m_started = true;
    m_listing_pending = sizeof(categories) / sizeof(categories[0]);
    m_listing_succeeded = 0;
    m_addons_xml = "<addons>\n";
    startNewsFetch();
    for (int i = 0; i < (int)(sizeof(categories) / sizeof(categories[0])); i++)
    {
        ListingContext *context = new ListingContext;
        context->owner = this;
        context->fetch = NULL;
        context->category = i;
        m_listing_contexts.push_back(context);

        emscripten_fetch_attr_t attr;
        emscripten_fetch_attr_init(&attr);
        strcpy(attr.requestMethod, "GET");
        attr.userData = context;
        attr.onsuccess = listingSuccess;
        attr.onerror = listingError;
        attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
        attr.timeoutMSecs = 30000;

        std::string url = "https://api.github.com/repos/"
                          "Yuichiro1307/Addon-Server/contents/";
        url += categories[i].api_path;
        url += "?ref=main&per_page=1000";
        context->fetch = emscripten_fetch(&attr, url.c_str());
        if (!context->fetch)
            finishListing(context, NULL, false);
    }
}

void EmscriptenNetworkHttp::startNewsFetch()
{
    NewsContext *context = new NewsContext;
    context->owner = this;
    context->fetch = NULL;
    m_news_context = context;

    emscripten_fetch_attr_t attr;
    emscripten_fetch_attr_init(&attr);
    strcpy(attr.requestMethod, "GET");
    attr.userData = context;
    attr.onsuccess = newsSuccess;
    attr.onerror = newsError;
    attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
    attr.timeoutMSecs = 30000;

    const char *url = "https://yuichiro1307.github.io/Addon-Server/news.xml";
    context->fetch = emscripten_fetch(&attr, url);
    if (!context->fetch)
        finishNews(context, NULL, false);
}

Request *EmscriptenNetworkHttp::downloadFileAsynchron(
    const std::string &url, const std::string &save, int priority,
    bool manage_memory)
{
    Request *request = new Request(Request::HC_DOWNLOAD_FILE, priority,
                                   manage_memory, url,
                                   save != "" ? save : url);
    if (UserConfigParams::m_internet_status != IPERM_ALLOWED)
    {
        request->setProgress(-1.0f);
        if (manage_memory)
        {
            delete request;
            return NULL;
        }
        return request;
    }

    DownloadContext *context = new DownloadContext;
    context->owner = this;
    context->fetch = NULL;
    context->request = request;
    m_download_contexts.push_back(context);

    emscripten_fetch_attr_t attr;
    emscripten_fetch_attr_init(&attr);
    strcpy(attr.requestMethod, "GET");
    attr.userData = context;
    attr.onsuccess = downloadSuccess;
    attr.onerror = downloadError;
    attr.onprogress = downloadProgress;
    attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY;
    attr.timeoutMSecs = 120000;

    context->fetch = emscripten_fetch(&attr, url.c_str());
    if (!context->fetch)
    {
        finishDownload(context, NULL, false);
        return manage_memory ? NULL : request;
    }
    return request;
}

void EmscriptenNetworkHttp::cancelAllDownloads()
{
    while (!m_download_contexts.empty())
    {
        DownloadContext *context = m_download_contexts.back();
        context->request->cancel();
        finishDownload(context, context->fetch, false);
    }
}

void EmscriptenNetworkHttp::finishListing(ListingContext *context,
                                          emscripten_fetch_t *fetch,
                                          bool success)
{
    if (fetch)
        fetch->userData = NULL;

    for (std::vector<ListingContext*>::iterator i = m_listing_contexts.begin();
         i != m_listing_contexts.end(); ++i)
    {
        if (*i == context)
        {
            m_listing_contexts.erase(i);
            break;
        }
    }

    if (m_started && context->category >= 0 &&
        context->category < (int)(sizeof(categories) / sizeof(categories[0])))
    {
        std::vector<ZipEntry> entries;
        if (success && fetch && fetch->data &&
            fetch->numBytes <= (uint64_t)SIZE_MAX &&
            fetch->status >= 200 && fetch->status < 300)
        {
            std::string json(fetch->data, (size_t)fetch->numBytes);
            success = parseContentsResponse(json, &entries);
        }
        else
            success = false;
        if (success)
        {
            m_listing_succeeded++;
            for (size_t i = 0; i < entries.size(); i++)
                appendAddonXml(categories[context->category], entries[i],
                               &m_addons_xml);
        }
        else
        {
            fprintf(stderr, "[addons] Could not parse addon listing '%s' "
                    "(HTTP %u).\n", categories[context->category].api_path,
                    fetch ? fetch->status : 0);
        }
    }
    else if (m_started)
    {
        fprintf(stderr, "[addons] Failed to fetch an addon listing.\n");
    }

    delete context;
    if (fetch)
        emscripten_fetch_close(fetch);

    if (m_started && --m_listing_pending == 0)
    {
        if (m_listing_succeeded == 0)
        {
            addons_manager->setErrorState();
            return;
        }
        m_addons_xml += "</addons>\n";
        std::string filename = file_manager->getAddonsFile("addons_online.xml");
        FILE *output = fopen(filename.c_str(), "wb");
        if (!output ||
            fwrite(m_addons_xml.data(), 1, m_addons_xml.size(), output)
                != m_addons_xml.size())
        {
            if (output)
                fclose(output);
            fprintf(stderr, "[addons] Could not write online addon list '%s'.\n",
                    filename.c_str());
            addons_manager->setErrorState();
            return;
        }
        if (fclose(output) != 0)
        {
            fprintf(stderr, "[addons] Could not close online addon list '%s'.\n",
                    filename.c_str());
            addons_manager->setErrorState();
            return;
        }

        XMLNode *xml = file_manager->createXMLTree(filename);
        if (!xml)
        {
            fprintf(stderr, "[addons] Could not parse online addon list '%s'.\n",
                    filename.c_str());
            addons_manager->setErrorState();
            return;
        }
        addons_manager->initOnline(xml);
    }
}

void EmscriptenNetworkHttp::finishDownload(DownloadContext *context,
                                           emscripten_fetch_t *fetch,
                                           bool success)
{
    if (fetch)
        fetch->userData = NULL;

    for (std::vector<DownloadContext*>::iterator i = m_download_contexts.begin();
         i != m_download_contexts.end(); ++i)
    {
        if (*i == context)
        {
            m_download_contexts.erase(i);
            break;
        }
    }

    Request *request = context->request;
    bool saved = false;
    if (success && !request->isCancelled() && fetch &&
        fetch->status >= 200 && fetch->status < 300 &&
        fetch->data && fetch->numBytes > 0 &&
        fetch->numBytes <= (uint64_t)SIZE_MAX)
    {
        std::string destination =
            file_manager->getAddonsFile(request->getSavePath());
        std::string part = destination + ".part";
        FILE *output = fopen(part.c_str(), "wb");
        if (output)
        {
            saved = fwrite(fetch->data, 1, (size_t)fetch->numBytes, output)
                    == (size_t)fetch->numBytes;
            if (fclose(output) != 0)
                saved = false;
        }
        if (saved)
            saved = rename(part.c_str(), destination.c_str()) == 0;
        if (!saved)
        {
            file_manager->removeFile(part);
            fprintf(stderr, "[addons] Could not save downloaded addon '%s'.\n",
                    destination.c_str());
        }
    }

    if (saved)
    {
        request->notifyAddon();
        request->setProgress(1.0f);
    }
    else
    {
        request->setProgress(-1.0f);
        fprintf(stderr, "[addons] Download failed for '%s' (HTTP %u).\n",
                request->getURL().c_str(), fetch ? fetch->status : 0);
    }

    bool manage_memory = request->manageMemory();
    delete context;
    if (fetch)
        emscripten_fetch_close(fetch);
    if (manage_memory)
        delete request;
}

void EmscriptenNetworkHttp::finishNews(NewsContext *context,
                                      emscripten_fetch_t *fetch,
                                      bool success)
{
    if (fetch)
        fetch->userData = NULL;
    if (m_news_context == context)
        m_news_context = NULL;

    bool valid_news = false;
    const std::string destination = file_manager->getAddonsFile("news.xml");
    const std::string part = destination + ".part";
    if (success && m_started && fetch &&
        fetch->status >= 200 && fetch->status < 300 &&
        fetch->data && fetch->numBytes > 0 &&
        fetch->numBytes <= (uint64_t)SIZE_MAX)
    {
        FILE *output = fopen(part.c_str(), "wb");
        bool saved = output &&
            fwrite(fetch->data, 1, (size_t)fetch->numBytes, output) ==
                (size_t)fetch->numBytes;
        if (output && fclose(output) != 0)
            saved = false;
        if (saved)
        {
            XMLNode *xml = file_manager->createXMLTree(part);
            if (xml && xml->getName() == "news")
            {
                for (unsigned int i = 0; i < xml->getNumNodes(); i++)
                {
                    const XMLNode *node = xml->getNode(i);
                    irr::core::stringw content;
                    if (node->getName() == "message" &&
                        node->get("content", &content) && !content.empty())
                    {
                        valid_news = true;
                        break;
                    }
                }
            }
            delete xml;
        }
        success = saved && valid_news;
    }
    else
        success = false;

    if (success)
    {
        const bool saved = rename(part.c_str(), destination.c_str()) == 0;
        if (saved)
            news_manager->init();
        else
        {
            fprintf(stderr, "[news] Could not update cached news file '%s'.\n",
                    destination.c_str());
        }
    }
    else
    {
        file_manager->removeFile(part);
        fprintf(stderr, "[news] Failed to fetch or parse news.xml (HTTP %u).\n",
                fetch ? fetch->status : 0);
    }

    delete context;
    if (fetch)
        emscripten_fetch_close(fetch);
}

void EmscriptenNetworkHttp::listingSuccess(emscripten_fetch_t *fetch)
{
    ListingContext *context = (ListingContext*)fetch->userData;
    if (context)
        context->owner->finishListing(context, fetch, true);
}

void EmscriptenNetworkHttp::listingError(emscripten_fetch_t *fetch)
{
    ListingContext *context = (ListingContext*)fetch->userData;
    if (context)
        context->owner->finishListing(context, fetch, false);
}

void EmscriptenNetworkHttp::downloadSuccess(emscripten_fetch_t *fetch)
{
    DownloadContext *context = (DownloadContext*)fetch->userData;
    if (context)
        context->owner->finishDownload(context, fetch, true);
}

void EmscriptenNetworkHttp::downloadError(emscripten_fetch_t *fetch)
{
    DownloadContext *context = (DownloadContext*)fetch->userData;
    if (context)
        context->owner->finishDownload(context, fetch, false);
}

void EmscriptenNetworkHttp::downloadProgress(emscripten_fetch_t *fetch)
{
    DownloadContext *context = (DownloadContext*)fetch->userData;
    if (!context)
        return;
    if (context->request->isCancelled())
    {
        context->owner->finishDownload(context, fetch, false);
        return;
    }
    if (fetch->totalBytes > 0)
    {
        float progress = (float)fetch->numBytes / (float)fetch->totalBytes;
        context->request->setProgress(std::min(progress, 0.99f));
    }
}

void EmscriptenNetworkHttp::newsSuccess(emscripten_fetch_t *fetch)
{
    NewsContext *context = (NewsContext*)fetch->userData;
    if (context)
        context->owner->finishNews(context, fetch, true);
}

void EmscriptenNetworkHttp::newsError(emscripten_fetch_t *fetch)
{
    NewsContext *context = (NewsContext*)fetch->userData;
    if (context)
        context->owner->finishNews(context, fetch, false);
}

//  SuperTuxKart - a fun racing game with go-kart
//  Copyright (C) 2013-2026
//
//  This program is free software; you can redistribute it and/or
//  modify it under the terms of the GNU General Public License
//  as published by the Free Software Foundation; either version 3
//  of the License, or (at your option) any later version.

#ifndef HEADER_EMSCRIPTEN_NETWORK_HTTP_HPP
#define HEADER_EMSCRIPTEN_NETWORK_HTTP_HPP

#include <emscripten/fetch.h>

#include <string>
#include <vector>

#include "addons/inetwork_http.hpp"

class EmscriptenNetworkHttp : public INetworkHttp
{
private:
    struct ListingContext;
    struct DownloadContext;

    std::vector<ListingContext*> m_listing_contexts;
    std::vector<DownloadContext*> m_download_contexts;
    std::string m_addons_xml;
    int m_listing_pending;
    int m_listing_succeeded;
    bool m_started;

    void startListing();
    void finishListing(ListingContext *context, emscripten_fetch_t *fetch,
                       bool success);
    void finishDownload(DownloadContext *context, emscripten_fetch_t *fetch,
                        bool success);

    static void listingSuccess(emscripten_fetch_t *fetch);
    static void listingError(emscripten_fetch_t *fetch);
    static void downloadSuccess(emscripten_fetch_t *fetch);
    static void downloadError(emscripten_fetch_t *fetch);
    static void downloadProgress(emscripten_fetch_t *fetch);

public:
    EmscriptenNetworkHttp();
    virtual ~EmscriptenNetworkHttp();

    virtual void startNetworkThread();
    virtual void stopNetworkThread();
    virtual void insertReInit();
    virtual Request *downloadFileAsynchron(const std::string &url,
                                           const std::string &save = "",
                                           int priority = 1,
                                           bool manage_memory = true);
    virtual void cancelAllDownloads();
};

#endif
